import LockForm from "./LockForm";

export default function LockPage() {
  return (
    <main className="lockRoot">
      <div className="lockBg" />
      <div className="lockWrap">
        <section className="lockCard">
          <div className="lockInner">
            <div>
              <div className="lockKicker">
                <span className="lockDot" />
                Private build · founder access
              </div>

              <h1 className="lockTitle">Directr is in private mode.</h1>
              <p className="lockSub">
                Access is limited while we stabilize uploads + editing.
              </p>

              <div className="lockTiles">
                <div className="lockTile">
                  <div className="lockTileTop">
                    <div className="lockTileLabel">Create</div>
                    <div className="lockTileMeta">scripts · angles · notes</div>
                  </div>
                  <div className="lockTileDesc">
                    Turn a prompt into a clean content plan.
                  </div>
                </div>

                <div className="lockTile">
                  <div className="lockTileTop">
                    <div className="lockTileLabel">Clipper</div>
                    <div className="lockTileMeta">hooks · moments</div>
                  </div>
                  <div className="lockTileDesc">
                    Find best segments and generate a clip plan.
                  </div>
                </div>

                <div className="lockTile">
                  <div className="lockTileTop">
                    <div className="lockTileLabel">Planner</div>
                    <div className="lockTileMeta">weekly execution</div>
                  </div>
                  <div className="lockTileDesc">
                    Turn outputs into a posting schedule + checklist.
                  </div>
                </div>
              </div>
            </div>

            <div className="lockPanel">
              <div className="lockPanelTitle">Enter access key</div>
              <LockForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
