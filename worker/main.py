import os, sys, time, traceback, tempfile, json, re, codecs, subprocess, shlex, mimetypes, requests
from supabase import create_client


DEFAULT_FONT = os.getenv("DEFAULT_FONT", "Inter")

STOPWORDS = {
    "the","a","an","and","or","but","if","then","so","to","of","in","on","for","with","at","by",
    "is","am","are","was","were","be","been","being","it","this","that","those","these","you","i",
    "we","they","he","she","them","us","me","my","your","our","their","as","from","not","no","yes"
}

def pick_keyword(text: str) -> str:
    words = [w.strip(".,!?;:\"'()[]{}").lower() for w in text.split()]
    words = [w for w in words if w and w not in STOPWORDS and w.isalpha()]
    if not words:
        return ""
    words.sort(key=len, reverse=True)
    return words[0][:20]

def _fmt_ass_time(t: float) -> str:
    cs = int(round(t * 100))
    h = cs // 360000
    m = (cs % 360000) // 6000
    s = (cs % 6000) // 100
    c = cs % 100
    return f"{h}:{m:02d}:{s:02d}.{c:02d}"

def _json_to_cues(obj):
    cues = []
    try:
        alt = obj["results"]["channels"][0]["alternatives"][0]
    except Exception:
        return cues
    paras = alt.get("paragraphs", {}).get("paragraphs")
    if paras:
        for p in paras:
            for s in p.get("sentences", []):
                a = float(s.get("start", 0.0))
                b = float(s.get("end", a + 2.0))
                text = (s.get("text") or "").strip()
                if text:
                    cues.append((a, b, text))
    else:
        words = alt.get("words", [])
        if words:
            group = []
            last_end = None
            for w in words:
                a = w.get("start"); b = w.get("end"); t = (w.get("word") or "").strip()
                if a is None or b is None or not t:
                    continue
                if not group:
                    group = [(float(a), float(b), t)]
                else:
                    gap = float(a) - float(last_end) if last_end is not None else 0.0
                    if gap > 0.6 or len(group) >= 10:
                        cues.append((group[0][0], group[-1][1], " ".join(x[2] for x in group)))
                        group = [(float(a), float(b), t)]
                    else:
                        group.append((float(a), float(b), t))
                last_end = b
            if group:
                cues.append((group[0][0], group[-1][1], " ".join(x[2] for x in group)))
        else:
            text = (alt.get("transcript") or "").strip()
            if text:
                dur = max(2.0, len(text.split()) * 0.3)
                cues.append((0.0, dur, text))
    return cues

def transcribe_to_ass_deepgram(local_media_path: str, font_name: str = DEFAULT_FONT, font_size: int = 56, overlay: bool = False) -> str:
    dg_key = os.getenv("DEEPGRAM_API_KEY")
    if not dg_key:
        raise RuntimeError("Missing DEEPGRAM_API_KEY")
    url = "https://api.deepgram.com/v1/listen"
    headers = {
        "Authorization": f"Token {dg_key}",
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
        raise RuntimeError(f"Deepgram error {resp.status_code}: {resp.text[:200]}")
    obj = resp.json()

    try:
        alt = obj["results"]["channels"][0]["alternatives"][0]
    except Exception:
        raise RuntimeError("No transcription alternatives returned.")

    sentences = []
    paras = alt.get("paragraphs", {}).get("paragraphs")
    if paras:
        for p in paras:
            for s in p.get("sentences", []):
                start = float(s.get("start", 0.0))
                end = float(s.get("end", start + 2.0))
                text = (s.get("text") or "").strip()
                if text:
                    sentences.append((start, end, text))
    else:
        words = alt.get("words", [])
        group, last_end = [], None
        for w in words:
            a = w.get("start"); b = w.get("end"); t = (w.get("word") or "").strip()
            if a is None or b is None or not t:
                continue
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

    word_list = alt.get("words", [])

    def words_in_range(a, b):
        out = []
        for w in word_list:
            ws = w.get("start"); we = w.get("end"); txt = (w.get("word") or "").strip()
            if ws is None or we is None or not txt:
                continue
            ws = float(ws); we = float(we)
            if ws >= a - 0.02 and we <= b + 0.02:
                out.append((ws, we, txt))
        return out

    def fmt_ass_time(t):
        cs = int(round(t * 100))
        h = cs // 360000
        m = (cs % 360000) // 6000
        s = (cs % 6000) // 100
        c = cs % 100
        return f"{h}:{m:02d}:{s:02d}.{c:02d}"

    ass_path = tempfile.mktemp(suffix=".ass")
    with open(ass_path, "w", encoding="utf-8") as out:
        out.write("[Script Info]\n")
        out.write("ScriptType: v4.00+\n")
        out.write("PlayResX: 1080\n")
        out.write("PlayResY: 1920\n")
        out.write("ScaledBorderAndShadow: yes\n\n")

        out.write("[V4+ Styles]\n")
        out.write("Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n")
        out.write(f"Style: CapBase,{font_name},{font_size},&H00FFFFFF,&H0026E6FF,&H00202020,&H00000000,-1,0,0,0,100,100,0,0,3,5,0,2,60,60,140,1\n")
        out.write(f"Style: CapHi,{font_name},{font_size},&H00FFFFFF,&H0026E6FF,&H00101010,&H00000000,-1,0,0,0,100,100,0,0,1,0,0,2,60,60,140,1\n")
        if overlay:
            out.write("Style: BigOverlay,Impact,220,&H55FFFFFF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,0,0,5,30,30,900,1\n")
        out.write("\n")

        out.write("[Events]\n")
        out.write("Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n")

        for (a, b, sentence) in sentences:
            start = fmt_ass_time(a)
            end = fmt_ass_time(b)

            base_line = (
                r"{\an2\blur2\fad(120,80)\t(0,200,\blur0)}" +
                sentence.replace("\n", " ").replace("\r", " ")
            )
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

            if overlay:
                kw = pick_keyword(sentence)
                if kw:
                    out.write(f"Dialogue: -1,{start},{end},BigOverlay,,0,0,900,,{kw.upper()}\\N\n")

    try:
        dlg_count = sum(1 for _ in open(ass_path, "r", encoding="utf-8") if _.startswith("Dialogue:"))
        print(f"   ASS cues: {dlg_count}", flush=True)
    except Exception:
        pass

    return ass_path
def load_env_clean(path):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8-sig") as f:
            for line in f:
                if "=" in line and not line.lstrip().startswith("#"):
                    k, v = line.strip().split("=", 1)
                    os.environ[k] = v

here = os.path.dirname(__file__)
load_env_clean(os.path.join(here, ".env"))

URL    = os.getenv("SUPABASE_URL")
SRKEY  = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
BUCKET = os.getenv("SUPABASE_BUCKET", "videos")
POLL   = int(os.getenv("POLL_SECONDS", "2"))

if not URL or not SRKEY:
    print("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"); sys.exit(1)

sb = create_client(URL, SRKEY)

def pick_one_queued():
    r = sb.table("jobs").select("*").eq("status","queued").order("created_at").limit(1).execute()
    d = r.data or []
    return d[0] if d else None

def set_status(jid, status, **extra):
    sb.table("jobs").update({"status": status, **extra}).eq("id", jid).execute()

def create_signed_url(path, seconds=900):
    res = sb.storage.from_(BUCKET).create_signed_url(path, seconds)
    return res.get("signedURL") or res.get("signedUrl") or res.get("signed_url")

def http_get_to_temp(url: str, suffix: str = ".mp4") -> str:
    fp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    with requests.get(url, stream=True, timeout=180) as r:
        r.raise_for_status()
        for chunk in r.iter_content(1 << 20):
            fp.write(chunk)
    fp.close()
    return fp.name

def json_deepgram_to_srt(obj) -> str:
    cues = []
    try:
        alt = obj["results"]["channels"][0]["alternatives"][0]
    except Exception:
        return ""
    paras = alt.get("paragraphs", {}).get("paragraphs")
    if paras:
        for p in paras:
            for s in p.get("sentences", []):
                start = float(s.get("start", 0.0))
                end = float(s.get("end", start + 2.0))
                text = (s.get("text") or "").strip()
                if text:
                    cues.append((start, end, text))
    else:
        words = alt.get("words", [])
        if words:
            group = []
            last_end = None
            for w in words:
                s = w.get("start"); e = w.get("end"); t = w.get("word", "")
                if s is None or e is None:
                    continue
                if not group:
                    group = [(s, e, t)]
                else:
                    if (last_end is not None and float(s) - float(last_end) > 0.6) or len(group) >= 12:
                        cues.append((float(group[0][0]), float(group[-1][1]), " ".join(g[2] for g in group)))
                        group = [(s, e, t)]
                    else:
                        group.append((s, e, t))
                last_end = e
            if group:
                cues.append((float(group[0][0]), float(group[-1][1]), " ".join(g[2] for g in group)))
        else:
            text = (alt.get("transcript") or "").strip()
            if text:
                dur = max(2.0, len(text.split()) * 0.3)
                cues.append((0.0, dur, text))
    def fmt(t):
        t = float(t)
        ms = int(round((t - int(t)) * 1000))
        h = int(t // 3600); m = int((t % 3600) // 60); s = int(t % 60)
        return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
    lines = []
    for i, (a, b, txt) in enumerate(cues, start=1):
        lines.append(str(i))
        lines.append(f"{fmt(a)} --> {fmt(b)}")
        lines.append(txt)
        lines.append("")
    return ("\n".join(lines).strip() + "\n") if lines else ""

def sanitize_srt(path: str) -> str:
    raw = open(path, "rb").read()
    if raw.startswith(codecs.BOM_UTF8):
        raw = raw[len(codecs.BOM_UTF8):]
    s = raw.decode("utf-8", errors="replace")
    s = s.replace("\r\n", "\n").replace("\r", "\n").strip()
    if s.lstrip().upper().startswith("WEBVTT"):
        lines = [ln for ln in s.split("\n") if not ln.strip().upper().startswith("WEBVTT")
                 and not ln.strip().startswith("KIND:")
                 and not ln.strip().startswith("LANGUAGE:")]
        s = "\n".join(lines)
        s = re.sub(r'(\d{2}:\d{2}:\d{2})\.(\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2})\.(\d{3})',
                   r'\1,\2 --> \3,\4', s)
        s = re.sub(r'(-->\s*[^\n]+?)(\s+align:[^\n]+|.*line:[^\n]+|.*position:[^\n]+)', r'\1', s)
        blocks = [blk.strip() for blk in s.split("\n\n") if "-->" in blk]
        out = []
        idx = 1
        for blk in blocks:
            parts = [ln for ln in blk.split("\n") if ln.strip()]
            if "-->" not in parts[0]:
                parts = [ln for ln in parts if "-->" in ln or ln == parts[0]]
            out.append(str(idx))
            out.extend(parts)
            out.append("")
            idx += 1
        s = "\n".join(out).strip() + "\n"
    if s.lstrip().startswith("{"):
        try:
            obj = json.loads(s)
            s = json_deepgram_to_srt(obj)
        except Exception:
            s = ""
    if not s.strip():
        raise RuntimeError("No valid SRT content after sanitization.")
    with open(path, "w", encoding="utf-8") as f:
        f.write(s)
    return path

def transcribe_to_srt_openai(local_media_path: str) -> str:
    from openai import OpenAI
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        raise RuntimeError("Missing OPENAI_API_KEY")
    client = OpenAI(api_key=key)
    with open(local_media_path, "rb") as f:
        tr = client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            response_format="srt"
        )
    srt_path = tempfile.mktemp(suffix=".srt")
    with open(srt_path, "w", encoding="utf-8") as out:
        out.write(tr)
    return srt_path

def transcribe_to_srt_deepgram(local_media_path: str) -> str:
    dg_key = os.getenv("DEEPGRAM_API_KEY")
    if not dg_key:
        raise RuntimeError("Missing DEEPGRAM_API_KEY")
    url = "https://api.deepgram.com/v1/listen"
    headers = {
        "Authorization": f"Token {dg_key}",
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
    }
    with open(local_media_path, "rb") as f:
        resp = requests.post(url, headers=headers, params=params, data=f, timeout=180)
    if resp.status_code >= 400:
        raise RuntimeError(f"Deepgram error {resp.status_code}: {resp.text[:200]}")
    obj = resp.json()
    srt_text = json_deepgram_to_srt(obj)
    if not srt_text.strip():
        raise RuntimeError("Deepgram JSON contained no captions.")
    srt_path = tempfile.mktemp(suffix=".srt")
    with open(srt_path, "w", encoding="utf-8") as out:
        out.write(srt_text)
    return srt_path

def transcribe_to_srt(local_media_path: str) -> str:
    try:
        return transcribe_to_srt_openai(local_media_path)
    except Exception as e:
        msg = str(e).lower()
        if ("insufficient_quota" in msg or "error code: 429" in msg or "rate limit" in msg) and os.getenv("DEEPGRAM_API_KEY"):
            print("   OpenAI quota/rate error; falling back to Deepgram...", flush=True)
            return transcribe_to_srt_deepgram(local_media_path)
        if os.getenv("DEEPGRAM_API_KEY"):
            return transcribe_to_srt_deepgram(local_media_path)
        raise

def run(cmd: list[str]):
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if p.returncode != 0:
        raise RuntimeError(f"FFmpeg failed:\n{' '.join(cmd)}\n{p.stdout}")
    return p.stdout

def burn_captions(input_mp4: str, srt_path: str, output_mp4: str):
    if str(srt_path).lower().endswith(".ass"):
        vf = f"scale=-2:1920,crop=1080:1920,ass={shlex.quote(srt_path)}"
    else:
        vf = (
            "scale=-2:1920,crop=1080:1920," +
            f"subtitles={shlex.quote(srt_path)}:charenc=UTF-8:" +
            "force_style='Fontname="
            + DEFAULT_FONT +
            ",Fontsize=64,PrimaryColour=&H00FFFFFF&,OutlineColour=&H00202020&,BorderStyle=3,Outline=4,Shadow=0,MarginV=120'"
        )
    run([
        "ffmpeg","-y",
        "-i", input_mp4,
        "-vf", vf,
        "-c:v", "h264",
        "-preset", "veryfast",
        "-crf", "20",
        "-c:a", "aac",
        "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        output_mp4
    ])

def upload_path(dest_path: str, local_path: str, content_type: str):
    sb.storage.from_(BUCKET).upload(dest_path, local_path, {"contentType": content_type, "upsert": "true"})

print(f"URL set? {bool(URL)}  SRKEY set? {bool(SRKEY)}")
print("Worker starting"); print(f"  URL: {URL}"); print(f"  Bucket: {BUCKET}"); print(f"  Poll: {POLL}s")

while True:
    try:
        job = pick_one_queued()
        if not job:
            time.sleep(POLL); continue

        jid = job["id"]
        src = job.get("source_path")
        print(f"Picked job {jid} | source_path={src}", flush=True)

        set_status(jid, "processing")
        if not src:
            set_status(jid, "error", error="missing source_path"); print("missing source_path", flush=True); continue

        url = create_signed_url(src, 900)
        local_mp4 = http_get_to_temp(url, ".mp4")
        print(f"   downloaded to {local_mp4}", flush=True)

        try:
            font_from_job = (job.get("style_font") or DEFAULT_FONT)
            overlay_flag = bool(job.get("style_overlay") or False)
            ass_path = transcribe_to_ass_deepgram(local_mp4, font_name=font_from_job, font_size=56, overlay=overlay_flag)
            print(f"   transcribed to {ass_path}", flush=True)
            sub_path_for_burn = ass_path
        except Exception as e_ass:
            print(f"   ASS transcription failed ({e_ass}); falling back to SRT", flush=True)
            srt_path = transcribe_to_srt(local_mp4)
            srt_path = sanitize_srt(srt_path)
            os.environ["DEFAULT_FONT"] = (job.get("style_font") or DEFAULT_FONT)
            print(f"   transcribed to {srt_path}", flush=True)
            sub_path_for_burn = srt_path

        captioned = tempfile.mktemp(suffix=".mp4")
        try:
            burn_captions(local_mp4, sub_path_for_burn, captioned)
            print(f"   burned captions to {captioned}", flush=True)

            out_mp4 = (src.rsplit(".",1)[0] if "." in src else src) + "-captioned.mp4"
            upload_path(out_mp4, captioned, "video/mp4")
            print(f"   uploaded captioned video to {out_mp4}", flush=True)

            if sub_path_for_burn.lower().endswith(".ass"):
                sub_out = (src.rsplit(".",1)[0] if "." in src else src) + "-captions.ass"
                upload_path(sub_out, sub_path_for_burn, "text/plain; charset=utf-8")
                print(f"   uploaded captions to {sub_out}", flush=True)
            else:
                sub_out = (src.rsplit(".",1)[0] if "." in src else src) + "-transcript.srt"
                upload_path(sub_out, sub_path_for_burn, "text/plain; charset=utf-8")
                print(f"   uploaded transcript to {sub_out}", flush=True)

            set_status(jid, "done", output_path=out_mp4)
            print(f"Done {jid}", flush=True)
        except Exception as burn_err:
            sub_out = (src.rsplit(".",1)[0] if "." in src else src) + ("-captions.ass" if sub_path_for_burn.lower().endswith(".ass") else "-transcript.srt")
            upload_path(sub_out, sub_path_for_burn, "text/plain; charset=utf-8")
            print(f"   burn failed, uploaded captions instead: {burn_err}", flush=True)
            set_status(jid, "done", output_path=sub_out)
            print(f"Done {jid}", flush=True)

    except Exception as e:
        emsg = str(e)
        if "insufficient_quota" in emsg.lower() or "error code: 429" in emsg.lower():
            emsg = "AI transcription quota exceeded. Add credits or set DEEPGRAM_API_KEY."
        print(f"Worker error: {emsg}\n{traceback.format_exc()}", flush=True)
        try:
            if 'jid' in locals():
                set_status(jid, "error", error=emsg[:250])
        except Exception:
            pass
        time.sleep(POLL)
