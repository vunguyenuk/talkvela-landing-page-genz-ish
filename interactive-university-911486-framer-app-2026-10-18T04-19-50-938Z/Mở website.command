#!/bin/bash
# Mở website này trên máy: nhấp đúp vào file này.
cd "$(dirname "$0")" || exit 1
PORT=8080
while lsof -nP -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; do PORT=$((PORT + 1)); done
if command -v node >/dev/null 2>&1; then
  URL="http://127.0.0.1:$PORT/"
  ( sleep 1; open "$URL" ) &
  echo "Website đang chạy tại $URL — đóng cửa sổ này để dừng."
  exec node ".site-server/static-server.mjs" --directory "$PWD" --port "$PORT"
else
  URL="http://127.0.0.1:$PORT/"
  ( sleep 1; open "$URL" ) &
  echo "Website đang chạy tại $URL — đóng cửa sổ này để dừng."
  exec python3 -m http.server "$PORT" --bind 127.0.0.1
fi
