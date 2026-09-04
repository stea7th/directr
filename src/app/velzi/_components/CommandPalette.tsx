"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type Command = {
  id: string;
  label: string;
  hint?: string;
  href?: string;
  run?: () => void;
};

export default function CommandPalette({
  open,
  onClose,
  commands,
}: {
  open: boolean;
  onClose: () => void;
  commands: Command[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((command) =>
      `${command.label} ${command.hint ?? ""}`.toLowerCase().includes(q),
    );
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      // Wait for the dialog to paint before stealing focus.
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  if (!open) return null;

  function pick(command: Command | undefined) {
    if (!command) return;
    onClose();
    if (command.run) command.run();
    else if (command.href) router.push(command.href);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      onClose();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((c) => (results.length ? (c + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((c) => (results.length ? (c - 1 + results.length) % results.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      pick(results[cursor]);
    }
  }

  return (
    <div
      className="v-cmd"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={onClose}
    >
      <div className="v-cmd__box" onClick={(e) => e.stopPropagation()} onKeyDown={onKeyDown}>
        <input
          ref={inputRef}
          className="v-cmd__input"
          placeholder="Jump to a view, a tool, or the Shopify admin…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search commands"
        />

        {results.length === 0 ? (
          <div className="v-cmd__empty">Nothing matches “{query}”.</div>
        ) : (
          <ul className="v-cmd__list">
            {results.map((command, i) => (
              <li key={command.id}>
                <button
                  type="button"
                  className={`v-cmd__item ${i === cursor ? "is-active" : ""}`}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => pick(command)}
                >
                  {command.label}
                  {command.hint ? <small>{command.hint}</small> : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
