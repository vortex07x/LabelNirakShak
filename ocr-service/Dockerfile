FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces runs containers as UID 1000 by convention. Creating
# this user explicitly (with -m, so it gets a real home directory) means
# PaddleOCR's model-weight downloads land in /home/user/.paddlex — a
# directory this user actually owns — instead of failing to write to
# somewhere only root could touch.
RUN useradd -m -u 1000 user
WORKDIR /home/user/app

COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --timeout 300 --retries 5 -r requirements.txt
COPY --chown=user . .

USER user

EXPOSE 7860
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860}