export type CreatorDNA = {
  userId?: string;
  niche: string;
  goals: string[];
  audience: string;
  voiceDescription: string;
  preferredFormats: string[];
  dislikedFormats: string[];
  availableLocations: string[];
  equipment: string[];
  postingFrequency: string;
  referenceCreators: string[];
  referenceVideos: string[];
  topics: string[];
  topicsToAvoid: string[];
  platforms: string[];
  completionScore: number;
  onboardedAt?: string;
};

export type DirectionShot = {
  order: number;
  type: string;
  title: string;
  description: string;
  dialogue: string;
  framing: string;
  duration: number;
  completed: boolean;
};

export type DirectionBeat = {
  start: number;
  end: number;
  instruction: string;
};

export type ScreenText = {
  text: string;
  timestamp: string;
};

export type DirectionStatus = "ready" | "filming" | "filmed" | "posted";

export type CreativeDirection = {
  id: string;
  sourceIdea: string;
  concept: string;
  angle: string;
  recommendedHook: string;
  alternateHooks: string[];
  whyThisWorks: string;
  format: string;
  estimatedDuration: number;
  estimatedFilmTime: number;
  delivery: string[];
  videoFlow: DirectionBeat[];
  shots: DirectionShot[];
  onScreenText: ScreenText[];
  caption: string;
  postingNote: string;
  status: DirectionStatus;
  createdAt: string;
  creatorRating?: "loved" | "fine" | "hated";
};

export type Recommendation = {
  id: string;
  concept: string;
  hook: string;
  format: string;
  duration: number;
  filmingMinutes: number;
  reason: string;
};

export const nicheOptions = [
  "Entrepreneurship",
  "Fitness",
  "Fashion",
  "Lifestyle",
  "Automotive",
  "Real estate",
  "Personal brand",
  "Education",
  "Entertainment",
];

export const goalOptions = [
  "Grow my audience",
  "Build authority",
  "Sell my product",
  "Get clients",
  "Build my personal brand",
  "Document my life",
  "Grow a community",
];

export const formatOptions = [
  "Talking to camera",
  "Vlog footage",
  "Voiceover",
  "Cinematic B-roll",
  "Screen recordings",
  "Podcast",
];

function cleanString(value: unknown, max = 600): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanList(value: unknown, max = 12): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(value.map((item) => cleanString(item, 160)).filter(Boolean))
  ).slice(0, max);
}

export function scoreCreatorDNA(profile: Partial<CreatorDNA>): number {
  const checks = [
    Boolean(profile.niche),
    Boolean(profile.goals?.length),
    Boolean(profile.voiceDescription),
    Boolean(profile.preferredFormats?.length),
    Boolean(profile.referenceCreators?.length || profile.referenceVideos?.length),
    Boolean(profile.audience),
    Boolean(profile.availableLocations?.length),
    Boolean(profile.equipment?.length),
    Boolean(profile.topics?.length),
    Boolean(profile.platforms?.length || profile.postingFrequency),
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function normalizeCreatorDNA(input: unknown): CreatorDNA {
  const source = input && typeof input === "object"
    ? (input as Record<string, unknown>)
    : {};

  const profile: CreatorDNA = {
    userId: cleanString(source.userId ?? source.user_id, 120) || undefined,
    niche: cleanString(source.niche, 120),
    goals: cleanList(source.goals),
    audience: cleanString(source.audience, 240),
    voiceDescription: cleanString(source.voiceDescription ?? source.voice_description),
    preferredFormats: cleanList(source.preferredFormats ?? source.preferred_formats),
    dislikedFormats: cleanList(source.dislikedFormats ?? source.disliked_formats),
    availableLocations: cleanList(source.availableLocations ?? source.available_locations),
    equipment: cleanList(source.equipment),
    postingFrequency: cleanString(source.postingFrequency ?? source.posting_frequency, 80),
    referenceCreators: cleanList(source.referenceCreators ?? source.reference_creators),
    referenceVideos: cleanList(source.referenceVideos ?? source.reference_videos),
    topics: cleanList(source.topics),
    topicsToAvoid: cleanList(source.topicsToAvoid ?? source.topics_to_avoid),
    platforms: cleanList(source.platforms),
    completionScore: 0,
    onboardedAt: cleanString(source.onboardedAt ?? source.onboarded_at, 80) || undefined,
  };

  profile.completionScore = scoreCreatorDNA(profile);
  return profile;
}

function numberWithin(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export function normalizeDirection(
  input: unknown,
  sourceIdea: string,
  existingId?: string
): CreativeDirection {
  if (!input || typeof input !== "object") {
    throw new Error("Directr returned an invalid direction.");
  }

  const value = input as Record<string, unknown>;
  const hook = cleanString(value.recommendedHook, 320);
  const concept = cleanString(value.concept, 180);
  const angle = cleanString(value.angle, 480);

  if (!hook || !concept || !angle) {
    throw new Error("Directr returned an incomplete direction. Try again.");
  }

  const rawShots = Array.isArray(value.shots) ? value.shots.slice(0, 7) : [];
  if (rawShots.length === 0) {
    throw new Error("Directr did not provide a shot list. Try again.");
  }

  const shots = rawShots.map((raw, index) => {
    const shot = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
    return {
      order: index + 1,
      type: cleanString(shot.type, 80) || "a_roll",
      title: cleanString(shot.title, 120) || `Shot ${index + 1}`,
      description: cleanString(shot.description, 400),
      dialogue: cleanString(shot.dialogue, 420),
      framing: cleanString(shot.framing, 220),
      duration: numberWithin(shot.duration, 6, 2, 90),
      completed: Boolean(shot.completed),
    };
  });

  const videoFlow = (Array.isArray(value.videoFlow) ? value.videoFlow : [])
    .slice(0, 7)
    .map((raw, index) => {
      const beat = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
      const start = numberWithin(beat.start, index * 7, 0, 180);
      return {
        start,
        end: numberWithin(beat.end, start + 7, start + 1, 240),
        instruction: cleanString(beat.instruction, 320),
      };
    })
    .filter((beat) => beat.instruction);

  const onScreenText = (Array.isArray(value.onScreenText) ? value.onScreenText : [])
    .slice(0, 5)
    .map((raw) => {
      const item = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
      return {
        text: cleanString(item.text, 180),
        timestamp: cleanString(item.timestamp, 40),
      };
    })
    .filter((item) => item.text);

  const statusValue = cleanString(value.status, 20);
  const status: DirectionStatus =
    statusValue === "filming" || statusValue === "filmed" || statusValue === "posted"
      ? statusValue
      : "ready";

  return {
    id: existingId || cleanString(value.id, 100) || crypto.randomUUID(),
    sourceIdea: cleanString(sourceIdea || value.sourceIdea, 800),
    concept,
    angle,
    recommendedHook: hook,
    alternateHooks: cleanList(value.alternateHooks, 2),
    whyThisWorks: cleanString(value.whyThisWorks, 560),
    format: cleanString(value.format, 120) || "Talking head",
    estimatedDuration: numberWithin(value.estimatedDuration, 30, 8, 180),
    estimatedFilmTime: numberWithin(value.estimatedFilmTime, 8, 2, 90),
    delivery: cleanList(value.delivery, 6),
    videoFlow,
    shots,
    onScreenText,
    caption: cleanString(value.caption, 900),
    postingNote: cleanString(value.postingNote, 320),
    status,
    createdAt: cleanString(value.createdAt, 80) || new Date().toISOString(),
    creatorRating:
      value.creatorRating === "loved" || value.creatorRating === "fine" || value.creatorRating === "hated"
        ? value.creatorRating
        : undefined,
  };
}

export const directionOutputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    concept: { type: "string" },
    angle: { type: "string" },
    recommendedHook: { type: "string" },
    alternateHooks: { type: "array", items: { type: "string" } },
    whyThisWorks: { type: "string" },
    format: { type: "string" },
    estimatedDuration: { type: "number" },
    estimatedFilmTime: { type: "number" },
    delivery: { type: "array", items: { type: "string" } },
    videoFlow: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          start: { type: "number" },
          end: { type: "number" },
          instruction: { type: "string" },
        },
        required: ["start", "end", "instruction"],
      },
    },
    shots: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          order: { type: "number" },
          type: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          dialogue: { type: "string" },
          framing: { type: "string" },
          duration: { type: "number" },
        },
        required: ["order", "type", "title", "description", "dialogue", "framing", "duration"],
      },
    },
    onScreenText: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: { text: { type: "string" }, timestamp: { type: "string" } },
        required: ["text", "timestamp"],
      },
    },
    caption: { type: "string" },
    postingNote: { type: "string" },
  },
  required: [
    "concept", "angle", "recommendedHook", "alternateHooks", "whyThisWorks",
    "format", "estimatedDuration", "estimatedFilmTime", "delivery", "videoFlow",
    "shots", "onScreenText", "caption", "postingNote",
  ],
} as const;

export function creatorContext(profile: CreatorDNA): string {
  return [
    `Niche: ${profile.niche || "not provided"}`,
    `Goals: ${profile.goals.join(", ") || "not provided"}`,
    `Audience: ${profile.audience || "not provided"}`,
    `Voice and taste: ${profile.voiceDescription || "understated, natural, specific"}`,
    `Preferred formats: ${profile.preferredFormats.join(", ") || "talking to camera"}`,
    `Disliked formats: ${profile.dislikedFormats.join(", ") || "none specified"}`,
    `Available filming locations: ${profile.availableLocations.join(", ") || "use a realistic everyday setting"}`,
    `Equipment: ${profile.equipment.join(", ") || "phone"}`,
    `Reference creators: ${profile.referenceCreators.join(", ") || "none specified"}`,
    `Topics: ${profile.topics.join(", ") || profile.niche || "not provided"}`,
    `Avoid: ${profile.topicsToAvoid.join(", ") || "guru content, inflated claims"}`,
  ].join("\n");
}

export function fallbackRecommendations(
  profile: CreatorDNA,
  history: CreativeDirection[] = []
): Recommendation[] {
  const subject = profile.niche || "what you are building";
  const lowerSubject = subject.charAt(0).toLowerCase() + subject.slice(1);
  const format = profile.preferredFormats[0] || "Talking to camera";
  const previousConcepts = new Set(history.map((item) => item.concept.toLowerCase()));
  const proposals: Recommendation[] = [
    {
      id: "story",
      concept: `The ${lowerSubject} mistake I kept avoiding`,
      hook: `The part of ${lowerSubject} I avoided ended up being the part that mattered.`,
      format,
      duration: 32,
      filmingMinutes: 8,
      reason: "A specific personal admission gives this more tension than another broad advice post.",
    },
    {
      id: "observation",
      concept: `Something people misunderstand about ${lowerSubject}`,
      hook: `Most people see the result. They miss the part that actually made it work.`,
      format: profile.preferredFormats.includes("Voiceover") ? "Voiceover" : format,
      duration: 27,
      filmingMinutes: 6,
      reason: `This connects your ${subject.toLowerCase()} positioning to a concrete observation without pretending to know your performance.`,
    },
    {
      id: "process",
      concept: `What ${lowerSubject} actually looks like today`,
      hook: "This is the part nobody puts in the finished version.",
      format: profile.preferredFormats.includes("Vlog footage") ? "Vlog footage" : "Talking head + cutaway",
      duration: 35,
      filmingMinutes: 10,
      reason: "A small real-world moment makes the content feel documented, not manufactured.",
    },
    {
      id: "decision",
      concept: `The decision that changed how I approach ${lowerSubject}`,
      hook: "I stopped doing the thing that looked impressive and started doing the thing that worked.",
      format,
      duration: 29,
      filmingMinutes: 7,
      reason: "A clear before-and-after creates a stronger story than a list of tips.",
    },
  ];

  return proposals.filter((item) => !previousConcepts.has(item.concept.toLowerCase())).slice(0, 3);
}

export function formatDirectionAsText(direction: CreativeDirection): string {
  return [
    `THE ANGLE\n${direction.angle}`,
    `THE HOOK\n${direction.recommendedHook}`,
    `WHY THIS WORKS\n${direction.whyThisWorks}`,
    `VIDEO FLOW\n${direction.videoFlow.map((beat) => `${beat.start}–${beat.end}s ${beat.instruction}`).join("\n")}`,
    `SHOT LIST\n${direction.shots.map((shot) => `${shot.order}. ${shot.title} — ${shot.description}`).join("\n")}`,
    `DELIVERY\n${direction.delivery.join("\n")}`,
    `CAPTION\n${direction.caption}`,
  ].join("\n\n");
}
