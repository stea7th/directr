"use client";

import {
  normalizeCreatorDNA,
  normalizeDirection,
  type CreatorDNA,
  type CreativeDirection,
} from "@/lib/directr";

const PROFILE_KEY = "directr:creator-dna:v1";
const CHANGE_EVENT = "directr:library-changed";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

function directionKey(userId?: string): string {
  return `directr:directions:v1:${userId || "anonymous"}`;
}

export function readLocalCreatorDNA(): CreatorDNA | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? normalizeCreatorDNA(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function writeLocalCreatorDNA(profile: CreatorDNA): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(normalizeCreatorDNA(profile)));
}

export function readLocalDirections(userId?: string): CreativeDirection[] {
  if (!canUseStorage() || !userId) return [];

  try {
    const raw = window.localStorage.getItem(directionKey(userId));
    const rows: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(rows)) return [];

    return rows.flatMap((item) => {
      try {
        const value = item as Record<string, unknown>;
        return [normalizeDirection(value, String(value.sourceIdea || ""), String(value.id || ""))];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

export function saveLocalDirection(direction: CreativeDirection, userId?: string): void {
  if (!canUseStorage() || !userId) return;
  const previous = readLocalDirections(userId).filter((item) => item.id !== direction.id);
  const next = [direction, ...previous]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 100);

  window.localStorage.setItem(directionKey(userId), JSON.stringify(next));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function onLibraryChange(callback: () => void): () => void {
  if (!canUseStorage()) return () => undefined;
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export async function fetchCreatorDNA(): Promise<CreatorDNA | null> {
  const response = await fetch("/api/creator-profile", { cache: "no-store" });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Could not load your Creator DNA.");

  const body = await response.json() as { profile?: CreatorDNA; userId?: string };
  const remote = normalizeCreatorDNA({ ...body.profile, userId: body.userId });
  const cached = readLocalCreatorDNA();

  if (!remote.onboardedAt && cached?.userId === body.userId && cached.onboardedAt) {
    return cached;
  }

  writeLocalCreatorDNA(remote);
  return remote;
}

export async function saveCreatorDNA(profile: CreatorDNA): Promise<CreatorDNA> {
  const response = await fetch("/api/creator-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });

  const body = await response.json() as { profile?: CreatorDNA; error?: string };
  if (!response.ok || !body.profile) {
    throw new Error(body.error || "Could not save your Creator DNA.");
  }

  const result = normalizeCreatorDNA(body.profile);
  writeLocalCreatorDNA(result);
  return result;
}

export async function syncDirection(direction: CreativeDirection): Promise<void> {
  try {
    await fetch("/api/directions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
  } catch {
    // The local copy remains available if cloud persistence is not configured yet.
  }
}

export async function fetchDirections(userId: string): Promise<CreativeDirection[]> {
  const local = readLocalDirections(userId);

  try {
    const response = await fetch("/api/directions", { cache: "no-store" });
    if (!response.ok) return local;
    const body = await response.json() as { directions?: CreativeDirection[] };
    const combined = new Map<string, CreativeDirection>();

    for (const item of body.directions || []) combined.set(item.id, item);
    for (const item of local) {
      const remote = combined.get(item.id);
      if (!remote || item.status !== "ready") combined.set(item.id, item);
    }

    return [...combined.values()].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  } catch {
    return local;
  }
}
