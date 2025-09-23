import os, time, json, shlex, mimetypes, tempfile, subprocess, requests
from supabase import create_client, Client

print("boot: importing worker/main.py", flush=True)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "videos")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
DEFAULT_FONT = os.getenv("DEFAULT_FONT", "Inter")
POLL_SECONDS = int(os.getenv("POLL_SECONDS", "3"))

_sb: Client | None = None
def get_supabase() -> Client:
    global _sb
    if _sb is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
        _sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        print("boot: supabase client created", flush=True)
    return _sb

def run(cmd: list[str]) -> str:
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if p.returncode != 0:
        tail = p.stdout[-4000:] if p.stdout else ""
        raise RuntimeError(f"cmd failed rc={p.returncode}\n{tail}")
    return p.stdout or ""

def safe_tmp(suffix: str) -> str:
    f = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        return f.name
    finally:
        f.close()

def download_from_storage(key: str) -> str:
    if not key or not isinstance(key, str):
        raise RuntimeError(f"invalid input_path: {key!r}")
    print(f"dl: bucket={SUPABASE_BUCKET} key={key}", flush=True)

    resp = get_supabase().storage.from_(SUPABASE_BUCKET).create_signed_url(key, 3600)
    signed_url = None
    if isinstance(resp, dict):
        signed_url = resp.get("signed_url") or resp.get("signedURL")
        if not signed_url:
            data = resp.get("data") or {}
            signed_url = data.get("signed_url") or data.get("signedURL") or data.get("signedUrl")
    else:
        data = getattr(resp, "data", None)
        if isinstance(data, dict):
            signed_url = data.get("signed_url") or data.get("signedURL") or data.get("signedUrl")
        if not signed_url:
            signed_url = getattr(resp, "signed_url", None) or getattr(resp, "signedURL", None)

    if not signed_url:
        raise RuntimeError(f"create_signed_url returned no URL for {key!r}: {repr(resp)[:200]}")

    fd, path = tempfile.mkstemp(suffix=os.path.splitext(key)[1] or ".mp4")
    os.close(fd)

    r = requests.get(signed_url, timeout=300)
    if r.status_code >= 400:
        raise RuntimeError(f"GET signed_url -> {r.status_code} {r.text[:160]}")

    with open(path, "wb") as f:
        f.write(r.content)

    if not os.path.exists(path) or os.path.getsize(path) == 0:
        raise RuntimeError("download produced empty file")
    print(f"dl: wrote {path}", flush=True)
    return path

def upload_path(key: str, local_path: str, content_type: str) -> None:
    if not os.path.exists(local_path):
        raise RuntimeError(f"upload_path missing: {local_path}")
    print(f"up: {local_path} -> {SUPABASE_BUCKET}/{key}", flush=True)
    with open(local_path, "rb") as f:
        get_supabase().storage.from_(SUPABASE_BUCKET).upload(
            path=key,
            file=f,
            file_options={"contentType": content_type, "upsert": True},
        )

def fmt_ass_time(t: float) -> str:
    cs = int(round(t * 100))
    h = cs // 360000
    m = (cs % 360000) // 6000
    s = (cs % 6000) // 100
    c = cs % 100
    return f"{h}:{m:02d}:{s:02d}.{c:02d}"

def transcribe_to_ass_deepgram(local_media_path: str, font_name: str = DEFAULT_FONT, font_size: int = 56) -> str:
    if not DEEPGRAM_API_KEY:
        raise RuntimeError("Missing DEEPGRAM_API_KEY")

    url = "https://api.deepgram.com/v1/listen"
    headers = {
        "Authorization": f"Token {DEEPGRAM_API_KEY}",
        "Content-Type": mimetypes.guess_type(local_media_path)[0] or "audio/mp4",
        "Accept": "application/json",
    }
    params = {
        "model": "nova-2-general",
        "smart_format": "true",
        "punctuate": "true",
        "numerals": "true",
        "paragraphs": "true",
        "utterances": "false",
        "diarize": "false",
    }
    with open(local_media_path, "rb") as f:
        resp = requests.post(url, headers=headers, params=params, data=f, timeout=180)
    if resp.status_code >= 400:
        raise RuntimeError(f"Deepgram {resp.status_code}: {resp.text[:200]}")
    obj = resp.json()
    alt = obj["results"]["channels"][0]["alternatives"][0]

    sentences = []
    paras = alt.get("paragraphs", {}).get("paragraphs")
    if paras:
        for p in paras:
            for s in p.get("sentences", []):
                a = float(s.get("start", 0.0))
                b = float(s.get("end", a + 2.0))
                txt = (s.get("text") or "").strip()
                if txt:
                    sentences.append((a, b, txt))
    else:
        words = alt.get("words", []) or []
        group, last_end = [], None
        for w in words:
            a = w.get("start"); b = w.get("end"); t = (w.get("word") or "").strip()
            if a is None or b is None or not t: continue
            a = float(a); b = float(b)
            if not group:
                group = [(a, b, t)]
            else:
                gap = a - (last_end if last_end is not None else a)
                dur = b - group[0][0]
                if gap > 0.6 or dur > 3.0 or len(group) >= 12:
                    sentences.append((group[0][0], group[-1][1], " ".join(x[2] for x in group)))
                    group = [(a, b, t)]
                else:
                    group.append((a, b, t))
            last_end = b
        if group:
            sentences.append((group[0][0], group[-1][1], " ".join(x[2] for x in group)))

    word_list = alt.get("words", []) or []

    def words_in_range(a, b):
        out = []
        for w in word_list:
            ws = w.get("start"); we = w.get("end"); txt = (w.get("word") or "").strip()
            if ws is None or we is None or not txt: continue
            ws = float(ws); we = float(we)
            if ws >= a - 0.02 and we <= b + 0.02:
                out.append((ws, we, txt))
        return out

    ass_path = safe_tmp(".ass")
    with open(ass_path, "w", encoding="utf-8") as out:
        out.write("[Script Info]\n")
        out.write("ScriptType: v4.00+\n")
        out.write("PlayResX: 1080\n")
        out.write("PlayResY: 1920\n")
        out.write("ScaledBorderAndShadow: yes\n\n")

        out.write("[V4+ Styles]\n")
        out.write("Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n")
        out.write(f"Style: CapBase,{font_name},{font_size},&H00FFFFFF,&H0026E6FF,&H00202020,&H00000000,-1,0,0,0,100,100,0,0,3,5,0,2,60,60,140,1\n")
        out.write(f"Style: CapHi,{font_name},{font_size},&H00FFFFFF,&H0026E6FF,&H00101010,&H00000000,-1,0,0,0,100,100,0,0,1,0,0,2,60,60,140,1\n\n")

        out.write("[Events]\n")
        out.write("Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n")

        for (a, b, sentence) in sentences:
            start = fmt_ass_time(a)
            end = fmt_ass_time(b)
            base_line = r"{\an2\blur2\fad(120,80)\t(0,200,\blur0)}" + sentence.replace("\n"," ").replace("\r"," ")
            out.write(f"Dialogue: 0,{start},{end},CapBase,,0,0,140,,{base_line}\\N\n")

            words = words_in_range(a, b)
            if words:
                k_parts = []
                for (ws, we, txt) in words:
                    dur_cs = max(1, int(round((we - ws) * 100)))
                    safe_txt = txt.replace("{","(").replace("}",")")
                    k_parts.append(rf"{{\k{dur_cs}}}{safe_txt}")
                hi_line = r"{\an2\blur0\bord3}" + " ".join(k_parts)
                out.write(f"Dialogue: 1,{start},{end},CapHi,,0,0,140,,{hi_line}\\N\n")
            else:
                hi_line = r"{\an2\t(0,300,\bord4)}" + sentence.replace("\n"," ").replace("\r"," ")
                out.write(f"Dialogue: 1,{start},{end},CapHi,,0,0,140,,{hi_line}\\N\n")

    try:
        dlg_count = sum(1 for line in open(ass_path, "r", encoding="utf-8") if line.startswith("Dialogue:"))
        print(f"ass: cues={dlg_count}", flush=True)
    except Exception:
        pass

    return ass_path

def burn_captions(input_mp4: str, sub_path: str, output_mp4: str):
    if not os.path.exists(input_mp4):
        raise RuntimeError(f"input missing {input_mp4}")
    if not os.path.exists(sub_path):
        raise RuntimeError(f"subs missing {sub_path}")

    # Scale to fit inside 1080x1920 (portrait), then pad to exactly 1080x1920.
    # This avoids invalid crops on narrow/wide sources.
    base = "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(1080-iw)/2:(1920-ih)/2:black"

    if sub_path.lower().endswith(".ass"):
        vf = f"{base},ass={shlex.quote(sub_path)}"
    else:
        vf = f"{base},subtitles={shlex.quote(sub_path)}:charenc=UTF-8:force_style='Fontname={DEFAULT_FONT},Fontsize=64,PrimaryColour=&H00FFFFFF&,OutlineColour=&H00202020&,BorderStyle=3,Outline=4,Shadow=0,MarginV=120'"

    cmd = [
        "ffmpeg", "-hide_banner", "-y",
        "-i", input_mp4,
        "-vf", vf,
        "-c:v","h264","-preset","veryfast","-crf","20",
        "-pix_fmt","yuv420p",
        "-c:a","aac","-b:a","192k",
        "-movflags","+faststart",
        output_mp4
    ]
    print("ffmpeg:", " ".join(shlex.quote(x) for x in cmd), flush=True)
    out = run(cmd)
    print("ffmpeg done:", out[-4000:], flush=True)
def process_job(job: dict):
    print(f"job: start {job.get('id')} -> {json.dumps(job, default=str)[:220]}", flush=True)
    get_supabase().table("jobs").update({"status": "processing"}).eq("id", job["id"]).execute()
    try:
        key = job.get("input_path")
        if not key or not isinstance(key, str):
            raise RuntimeError(f"invalid input_path in row: {key!r}")

        local_in = download_from_storage(key)
        if not os.path.exists(local_in):
            raise RuntimeError(f"input file missing after download: {local_in}")
        print(f"job: input {local_in}", flush=True)

        ass_path = transcribe_to_ass_deepgram(local_in, DEFAULT_FONT, 56)
        if not os.path.exists(ass_path):
            raise RuntimeError(f"ASS file missing: {ass_path}")
        print("job: got ASS", flush=True)

        out_mp4 = safe_tmp("-captioned.mp4")
        print(f"job: burning -> {out_mp4}", flush=True)
        burn_captions(local_in, ass_path, out_mp4)

        if not os.path.exists(out_mp4) or os.path.getsize(out_mp4) == 0:
            raise RuntimeError("ffmpeg produced no output")
        print(f"job: burned {out_mp4} size={os.path.getsize(out_mp4)}", flush=True)

        out_key = f"{job['user_id']}/{job['id']}-captioned.mp4"
        upload_path(out_key, out_mp4, "video/mp4")
        print(f"job: uploaded {out_key}", flush=True)

        get_supabase().table("jobs").update({
            "status": "done",
            "output_path": out_key
        }).eq("id", job["id"]).execute()
        print("job: done", flush=True)

    except Exception as e:
        msg = str(e)
        print(f"job: error {job.get('id')}: {msg}", flush=True)
        get_supabase().table("jobs").update({
            "status": "error",
            "error": msg[:240]
        }).eq("id", job["id"]).execute()

def poll_once() -> bool:
    sb = get_supabase()
    res = sb.table("jobs").select("*").eq("status","queued").order("created_at", desc=False).limit(1).execute()
    items = res.data or []
    if not items:
        return False
    print("loop: found queued job", flush=True)
    process_job(items[0])
    return True

def main():
    print("boot: starting loop", flush=True)
    # quick health probe: count jobs table
    try:
        cnt = get_supabase().table("jobs").select("id", count="exact").limit(1).execute()
        print(f"boot: jobs table reachable (count mode ok)", flush=True)
    except Exception as e:
        print(f"boot: jobs table check failed: {e}", flush=True)
    tick = 0
    while True:
        try:
            did = poll_once()
        except Exception as e:
            print(f"loop: error {e}", flush=True)
            did = False
        if not did:
            tick += 1
            if tick % 10 == 0:
                print("loop: heartbeat (idle)", flush=True)
        time.sleep(0 if did else POLL_SECONDS)

if __name__ == "__main__":
    main()
