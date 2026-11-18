# ApnaKarigar: backend integration

```
apnakarigar-integration/
├── backend/          FastAPI + MongoDB server  (new)
└── APNAKARIGAR/src/  files to copy over your project's src/
```

## 1. Start the backend
```bash
cd backend
docker compose up -d                       # MongoDB (or use a free MongoDB Atlas URL in .env)
python -m venv .venv && .venv\Scripts\activate      # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env                     # then set JWT_SECRET to a long random string
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- Open http://localhost:8000/docs to try every endpoint.
- First start seeds your 5 demo artisans and 8 works, so the app looks the same as before.
- Run the tests (no MongoDB needed): `pytest`

## 2. Update the app
1. Copy `APNAKARIGAR/src/*` over your project's `src/` (overwrites 11 files, adds 7).
2. `npx expo install expo-image-picker expo-secure-store`
   (`upload.tsx` already imported image-picker, but it was missing from package.json.)
3. `npx expo start`. The app finds the server automatically on the same Wi-Fi.
   - Using the ngrok tunnel, or a deployed server? Create `.env` in the project root:
     `EXPO_PUBLIC_API_URL=https://your-server.example.com`
   - Windows firewall may ask to allow Python on port 8000: allow it for private networks.

## What changed in the app
| Screen | Before | Now |
|---|---|---|
| Landing | role picker | same + Sign in / Sign out link |
| Discover | static list | `GET /artisans` |
| Community | static + on-device uploads | `GET /works` (everyone sees everyone's work) |
| Artisan profile | static | `GET /artisans/:id` + works; **I can help** sends a real offer |
| Upload | saved on-device only | uploads the photo, creates the work, updates the artisan's current need |
| Sign in / register (new) | – | phone + password; artisans also give craft and village |
| Offers (new, artisan tab) | – | who offered help, tap a number to call |

Browsing needs no account. Signing in is needed only to publish work or offer help.
`src/data/artisans.ts` is no longer used by the app (the backend seeds from the same data); delete it if you like.
