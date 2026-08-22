"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatOptions,
  goalOptions,
  nicheOptions,
  normalizeCreatorDNA,
  type CreatorDNA,
} from "@/lib/directr";
import { saveCreatorDNA } from "@/lib/directr-client";

const steps = ["Your world", "Your goal", "Your voice", "Your taste", "Your setup"];

function toggle(items: string[], value: string): string[] {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

function splitLines(value: string): string[] {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

export default function OnboardingFlow({
  initialProfile,
  editing = false,
}: {
  initialProfile: CreatorDNA;
  editing?: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<CreatorDNA>(normalizeCreatorDNA({
    ...initialProfile,
    platforms: initialProfile.platforms.length ? initialProfile.platforms : ["Instagram", "TikTok"],
  }));
  const [creatorText, setCreatorText] = useState(initialProfile.referenceCreators.join("\n"));
  const [referenceText, setReferenceText] = useState(initialProfile.referenceVideos.join("\n"));
  const [locationText, setLocationText] = useState(initialProfile.availableLocations.join(", "));
  const [equipmentText, setEquipmentText] = useState(initialProfile.equipment.join(", "));
  const [customNiche, setCustomNiche] = useState(
    initialProfile.niche && !nicheOptions.includes(initialProfile.niche) ? initialProfile.niche : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(next: Partial<CreatorDNA>) {
    setProfile((current) => normalizeCreatorDNA({ ...current, ...next }));
    setError("");
  }

  function canContinue(): boolean {
    if (step === 0) return Boolean(profile.niche.trim());
    if (step === 1) return profile.goals.length > 0;
    if (step === 2) return Boolean(profile.voiceDescription.trim());
    if (step === 4) return profile.preferredFormats.length > 0;
    return true;
  }

  async function finish() {
    if (!canContinue()) return;
    setSaving(true);
    setError("");

    try {
      const next = normalizeCreatorDNA({
        ...profile,
        referenceCreators: splitLines(creatorText),
        referenceVideos: splitLines(referenceText),
        availableLocations: splitLines(locationText),
        equipment: splitLines(equipmentText),
        topics: profile.topics.length ? profile.topics : [profile.niche],
        onboardedAt: profile.onboardedAt || new Date().toISOString(),
      });

      await saveCreatorDNA(next);
      router.push("/today");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save your Creator DNA.");
      setSaving(false);
    }
  }

  return (
    <div className="onboarding-shell">
      <div className="onboarding-topline">
        <span>{editing ? "Update your Creator DNA" : "Build your Creator DNA"}</span>
        <span>{String(step + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}</span>
      </div>

      <div className="onboarding-progress" aria-label={`Step ${step + 1} of ${steps.length}`}>
        <span style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>

      <section className="onboarding-stage" key={step}>
        {step === 0 && (
          <>
            <p className="section-kicker">{steps[step]}</p>
            <h1>What are you building an audience around?</h1>
            <p className="onboarding-description">Start with the world your content should live in. Directr will get more specific from there.</p>
            <div className="choice-grid">
              {nicheOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => { update({ niche: option }); setCustomNiche(""); }}
                  className={`choice-button ${profile.niche === option ? "is-selected" : ""}`}
                >
                  {option}
                </button>
              ))}
            </div>
            <input
              className="directr-input onboarding-custom"
              placeholder="Something else? Tell Directr."
              value={customNiche}
              onChange={(event) => {
                setCustomNiche(event.target.value);
                update({ niche: event.target.value });
              }}
            />
          </>
        )}

        {step === 1 && (
          <>
            <p className="section-kicker">{steps[step]}</p>
            <h1>What should content do for you?</h1>
            <p className="onboarding-description">Choose the outcomes that matter. Directr uses these to decide what deserves your time.</p>
            <div className="choice-grid choice-grid--wide">
              {goalOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => update({ goals: toggle(profile.goals, option) })}
                  className={`choice-button ${profile.goals.includes(option) ? "is-selected" : ""}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="section-kicker">{steps[step]}</p>
            <h1>What should Directr understand about you?</h1>
            <p className="onboarding-description">Explain the taste, personality, or lines you do not want your content to cross.</p>
            <textarea
              className="directr-textarea onboarding-textarea"
              placeholder="I’m building businesses and documenting it. I hate guru content. I want everything to feel understated, cinematic, and real."
              value={profile.voiceDescription}
              onChange={(event) => update({ voiceDescription: event.target.value })}
              rows={6}
            />
            <label className="onboarding-field">
              <span>Who is this for? <span className="optional-note">Optional</span></span>
              <input
                className="directr-input"
                placeholder="People figuring out how to build something of their own."
                value={profile.audience}
                onChange={(event) => update({ audience: event.target.value })}
              />
            </label>
          </>
        )}

        {step === 3 && (
          <>
            <p className="section-kicker">{steps[step]}</p>
            <h1>Show Directr what you like.</h1>
            <p className="onboarding-description">Add creators or videos you respect. These are saved as taste references; automatic video analysis is not available yet.</p>
            <label className="onboarding-field">
              <span>Creator usernames <span className="optional-note">One per line</span></span>
              <textarea
                className="directr-textarea"
                placeholder="@creatorone&#10;@creatortwo"
                value={creatorText}
                onChange={(event) => setCreatorText(event.target.value)}
                rows={3}
              />
            </label>
            <label className="onboarding-field">
              <span>Reference video links <span className="optional-note">Optional</span></span>
              <textarea
                className="directr-textarea"
                placeholder="https://instagram.com/reel/..."
                value={referenceText}
                onChange={(event) => setReferenceText(event.target.value)}
                rows={2}
              />
            </label>
          </>
        )}

        {step === 4 && (
          <>
            <p className="section-kicker">{steps[step]}</p>
            <h1>How do you usually film?</h1>
            <p className="onboarding-description">Directr should work with the setup you actually have, not invent a production team.</p>
            <div className="choice-grid">
              {formatOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => update({ preferredFormats: toggle(profile.preferredFormats, option) })}
                  className={`choice-button ${profile.preferredFormats.includes(option) ? "is-selected" : ""}`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="onboarding-detail-grid">
              <label className="onboarding-field">
                <span>Places you can film</span>
                <input className="directr-input" placeholder="Desk, car, outside" value={locationText} onChange={(event) => setLocationText(event.target.value)} />
              </label>
              <label className="onboarding-field">
                <span>Your setup</span>
                <input className="directr-input" placeholder="iPhone, wireless mic" value={equipmentText} onChange={(event) => setEquipmentText(event.target.value)} />
              </label>
            </div>
          </>
        )}

        {error && <p className="directr-error" role="alert">{error}</p>}

        <div className="onboarding-actions">
          {step > 0 ? (
            <button type="button" className="directr-button directr-button--quiet" onClick={() => setStep(step - 1)} disabled={saving}>
              Back
            </button>
          ) : editing ? (
            <Link href="/today" className="directr-button directr-button--quiet">Cancel</Link>
          ) : <span />}

          {step < steps.length - 1 ? (
            <button
              type="button"
              className="directr-button directr-button--accent"
              onClick={() => setStep(step + 1)}
              disabled={!canContinue()}
            >
              Continue <span aria-hidden="true">→</span>
            </button>
          ) : (
            <button type="button" className="directr-button directr-button--accent" onClick={finish} disabled={!canContinue() || saving}>
              {saving ? "Getting your Director ready…" : editing ? "Save Creator DNA" : "Your Director is ready →"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
