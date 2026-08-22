// src/app/lock/LockScreen.tsx
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
          Your creative director is getting ready. Access is limited while we finish the experience.
        </p>

        <div className="lockGrid">
          <div className="lockFeatures">
            <div className="lockFeat">
              <b>
                Direct <span style={{ opacity: 0.7 }}>angles • hooks • shot lists</span>
              </b>
              <p>Turn a prompt or upload into a clean content plan.</p>
            </div>
            <div className="lockFeat">
              <b>
                Film Mode <span style={{ opacity: 0.7 }}>one shot at a time</span>
              </b>
              <p>Know exactly what to film and when to stop.</p>
            </div>
            <div className="lockFeat">
              <b>
                Coach <span style={{ opacity: 0.7 }}>clear creative feedback</span>
              </b>
              <p>Get better direction without the generic advice.</p>
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
