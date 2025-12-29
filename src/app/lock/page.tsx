// src/app/lock/page.tsx
import LockForm from "./LockForm";

export default function LockPage() {
  return (
    <main className="lockRoot">
      <div className="lockBg" />

      <div className="lockWrap">
        <div className="lockCard">
          <div className="lockInner">
            {/* LEFT */}
            <section>
              <div className="lockKicker">
                <span className="lockDot" />
                Private build · founder access
              </div>

              <h1 className="lockTitle">Directr is in private mode.</h1>
              <p className="lockSub">
                Access is limited while we stabilize uploads + editing.
              </p>

              <div className="lockTiles">
                <article className="lockTile">
                  <div className="lockTileTop">
                    <div className="lockTileLabel">Create</div>
                    <div className="lockTileMeta">ready</div>
                  </div>
                  <div className="lockTileDesc">Generate scripts + creative direction.</div>
                </article>

                <article className="lockTile">
                  <div className="lockTileTop">
                    <div className="lockTileLabel">Clipper</div>
                    <div className="lockTileMeta">beta</div>
                  </div>
                  <div className="lockTileDesc">Upload → find hooks + moments.</div>
                </article>

                <article className="lockTile">
                  <div className="lockTileTop">
                    <div className="lockTileLabel">Planner</div>
                    <div className="lockTileMeta">soon</div>
                  </div>
                  <div className="lockTileDesc">Plan posts + deadlines like a system.</div>
                </article>
              </div>
            </section>

            {/* RIGHT */}
            <aside className="lockPanel">
              <div className="lockPanelTitle">Enter access key</div>
              <LockForm />
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
