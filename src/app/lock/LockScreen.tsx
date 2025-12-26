// src/app/lock/LockScreen.tsx
import "./lock.css";
import LockForm from "./LockForm";

export default function LockScreen() {
  return (
    <div className="lockWrap">
      <div className="lockBg" />
      <div className="lockNoise" />

      <div className="lockCard">
        <div className="lockTop">
          <div className="lockPill">
            <span className="lockDot" />
            Private build • founder access
          </div>
        </div>

        <h1 className="lockH1">Directr is in private mode.</h1>
        <p className="lockSub">
          AI-powered creation → clips → captions. Access is limited while we stabilize uploads + editing.
        </p>

        <div className="lockGrid">
          <div className="lockFeatures">
            <div className="lockFeat">
              <b>
                Create <span style={{ opacity: 0.7 }}>scripts • angles • notes</span>
              </b>
              <p>Turn a prompt or upload into a clean content plan.</p>
            </div>
            <div className="lockFeat">
              <b>
                Clipper <span style={{ opacity: 0.7 }}>hooks • moments</span>
              </b>
              <p>Find the best segments and generate a clip plan.</p>
            </div>
            <div className="lockFeat">
              <b>
                Planner <span style={{ opacity: 0.7 }}>weekly execution</span>
              </b>
              <p>Turn outputs into a posting schedule + checklist.</p>
            </div>
          </div>

          <div className="lockPanel">
            <LockForm />
          </div>
        </div>
      </div>
    </div>
  );
}
