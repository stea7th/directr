// src/app/lock/page.tsx
import "./lock.css";
import LockForm from "./LockForm";

export default function LockPage() {
  return (
    <div className="lockStage">
      <div className="lockWrap">
        <div className="lockCard">
          <div className="lockCard__inner">
            <div className="lockPill">
              <span className="lockDot" />
              Private build · founder access
            </div>

            <h1 className="lockTitle">Directr is in private mode.</h1>
            <p className="lockSub">
              We’re stabilizing uploads + editing. Access is limited while we
              harden the pipeline.
            </p>

            <div className="lockTiles">
              <div className="lockTile">
                <h4>Create</h4>
                <p>Turn prompts + uploads into scripts, angles, notes.</p>
              </div>
              <div className="lockTile">
                <h4>Clipper</h4>
                <p>Find hooks + key moments and generate a clip plan.</p>
              </div>
              <div className="lockTile">
                <h4>Planner</h4>
                <p>Convert outputs into a weekly posting execution list.</p>
              </div>
            </div>

            <div className="lockBottom">
              <div className="lockPanel">
                <h3>Enter access key</h3>
                <p>Your device stays unlocked for 7 days.</p>
                <LockForm />
                <div className="lockSmall">
                  Tip: set <code>SITE_LOCK_ENABLED=false</code> to disable lock.
                </div>
              </div>

              <div className="lockPanel">
                <h3>Want access?</h3>
                <p>Join the list or request a founder pass.</p>
                <div className="lockActions">
                  <button className="lockBtn" type="button">
                    Join waitlist
                  </button>
                  <button className="lockBtn" type="button">
                    Request access
                  </button>
                </div>
                <div className="lockSmall">
                  (We can wire these to Supabase later — UI only for now.)
                </div>
              </div>
            </div>

            <div className="lockMeta">
              <span>directr<span style={{ color: "var(--accent)" }}>.</span></span>
              <span>Private mode is temporary.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
