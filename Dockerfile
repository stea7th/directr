FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg fonts-dejavu fonts-noto-core && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY worker/ /app/worker/
COPY worker/requirements.txt /app/worker/requirements.txt

RUN pip install --no-cache-dir -r /app/worker/requirements.txt

WORKDIR /app/worker

CMD ["python", "-u", "main.py"]]
