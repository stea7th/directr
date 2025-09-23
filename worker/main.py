import os, time, tempfile, mimetypes, shlex, json, subprocess, requests
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "videos")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
DEFAULT_FONT = os.getenv("DEFAULT_FONT", "Inter")
POLL_SECONDS = int(os.getenv("POLL_SECONDS", "3"))

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def run(cmd):
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if p.returncode != 0:
        raise RuntimeError(p.stdout)
    return p.stdout

def download_from_storage(key: str) -> str:
    res = supabase.storage.from_(SUPABASE_BUCKET).create_signed_url(key, 3600)
    url = res.get("signedURL") or res.get("signedUrl") or res["signed_url"]
    fd, path = tempfile.mkstemp(suffix=os.path.splitext(key)[1] or ".mp4")
    os.close(fd)
    r = requests.get(url, timeout=300)
    r.raise_for_status()
    with open(path, "wb") as f:
        f.write(r.content)
    return path

def upload_path(key: str, local_path: str, content_type: str) -> None:
    with open(local_path, "rb") as f:
        supabase.storage.from_(SUPABASE_BUCKET).upload(
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

def transcribe_to_ass_deepgram(local_media_path: str, font_name: str = DEFAULT_FONT, font_size: int = 56, overlay: bool = False) -> str:
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
                a = float(s.get("start", 0.0)); b = float(s.get("end", a + 2.0))
                txt = (s.get("text") or "").strip()
                if txt:
                    sentences.append((a, b, txt))
    else:
        words = alt.get("words", [])
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

    word_list = alt.get("words", [])

    def words_in_range(a, b):
        out = []
        for w in word_list:
            ws = w.get("start"); we = w.get("end"); txt = (w.get("word") or "").strip()
            if ws is None or we is None or not txt: continue
            ws = float(ws); we = float(we)
            if ws >= a - 0.02 and we <= b + 0.02:
                out.append((ws, we, txt))
        return out

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
        out.write("\n")

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

    return ass_path

def burn_captions(input_mp4: str, sub_path: str, output_mp4: str):
    if sub_path.lower().endswith(".ass"):
        vf = f"scale=-2:1920,crop=1080:1920,ass={shlex.quote(sub_path)}"
    else:
        vf = "scale=-2:1920,crop=1080:1920," + f"subtitles={shlex.quote(sub_path)}:charenc=UTF-8:force_style='Fontname={DEFAULT_FONT},Fontsize=64,PrimaryColour=&H00FFFFFF&,OutlineColour=&H00202020&,BorderStyle=3,Outline=4,Shadow=0,MarginV=120'"
    run([
        "ffmpeg","-y",
        "-i", input_mp4,
        "-vf", vf,
        "-c:v","h264","-preset","veryfast","-crf","20",
        "-c:a","aac","-b:a","192k",
        "-pix_fmt","yuv420p",
        "-movflags","+faststart",
        output_mp4
    ])

def process_job(job: dict):
    supabase.table("jobs").update({"status":"processing"}).eq("id", job["id"]).execute()
    local_in = download_from_storage(job["input_path"])
    ass_path = transcribe_to_ass_deepgram(local_in, DEFAULT_FONT, 56, overlay=False)
    out_mp4 = tempfile.mktemp(suffix="-captioned.mp4")
    try:
        burn_captions(local_in, ass_path, out_mp4)
    except Exception as e:
        supabase.table("jobs").update({"status":"error","error":f"ffmpeg:{str(e)[:180]}"}).eq("id", job["id"]).execute()
        return
    key = f"{job['user_id']}/{job['id']}-captioned.mp4"
    upload_path(key, out_mp4, "video/mp4")
    supabase.table("jobs").update({"status":"done","output_path":key}).eq("id", job["id"]).execute()

def poll_once():
    res = supabase.table("jobs").select("*").eq("status","queued").order("created_at", desc=False).limit(1).execute()
    items = res.data or []
    if not items:
        return False
    process_job(items[0])
    return True

def main():
    print("worker started", flush=True)
    while True:
        try:
            did = poll_once()
        except Exception as e:
            print(f"error: {e}", flush=True)
            did = False
        time.sleep(0 if did else POLL_SECONDS)

if __name__ == "__main__":
    main()
