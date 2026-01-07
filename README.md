## Drone Takeoff / Landing Mobile Flow

This Expo app now guides a full takeoff/landing operation with validation, auto-approval, camera streaming, and a mission summary.

### Run the app

1. Install deps (already installed in repo, run if needed):
   ```
   npm install
   ```
2. Start Expo:
   ```
   npm start
   ```
3. Open on a real device via Expo Go or a development build. Camera + location permissions are required.

### Streaming server (dev/test)

Streaming uses WebSocket frames to `STREAM_SERVER_URL` (`ws://localhost:8080/stream` by default). Override with `EXPO_PUBLIC_STREAM_URL`.

Quick test server (Node 18+):
```
npm install ws
node -e "const { WebSocketServer } = require('ws'); const wss = new WebSocketServer({port:8080}); console.log('listening ws://0.0.0.0:8080/stream'); wss.on('connection', ws => ws.on('message', msg => { const { ts } = JSON.parse(msg.toString()); console.log('frame', ts); }));"
```

### Flow

- New Flight: capture GPS (manual or “Use current GPS”), drone size, takeoff/landing, validate.
- Pending → auto-approve after ~2s.
- Camera/Streaming: camera opens, instructions shown, streaming starts automatically when ready; LIVE indicator + connection status. Streaming stops only when “Finish operation”.
- Summary: operation type, duration, times, location, drone size; “Complete mission” resets for next flight.

### Notes

- Haptics fire on approval and streaming start (Expo Haptics).
- Frame streaming uses low-quality base64 photos at ~1.4s intervals for dev safety.
- Backgrounding pauses frame capture; return to foreground to resume sending frames.
