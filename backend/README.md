# ApnaKarigar API

JSON is camelCase and matches `src/types/app.ts` (`Artisan`, `Work`, `Requirement`).

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /auth/register | – | `{name, phone, password, role, craft?, village?, bio?}` → `{token, user}`. Artisans also get a profile. |
| POST | /auth/login | – | `{phone, password}` → `{token, user}` |
| GET | /auth/me | any | current user |
| GET | /artisans?q=&category= | – | list (newest first); `workIds` computed |
| GET | /artisans/{id} | – | one artisan |
| PATCH | /artisans/me | artisan | edit profile / current requirement |
| GET | /works?artisanId= | – | community feed, newest first |
| POST | /works | artisan | `{title, description, image, requirement?}`; `requirement` also updates the artisan's current need |
| DELETE | /works/{id} | artisan (owner) | remove |
| POST | /upload | artisan | multipart `file` (JPEG/PNG/WebP ≤ 5 MB) → `{url}`; files served from `/uploads/*` |
| POST | /artisans/{id}/support | any | the "I can help" button (one per person per artisan) |
| GET | /supports/mine | any | artisan ids already offered |
| GET | /supports/received | artisan | offers to me, with the supporter's phone |

Before going live: set a long random `JWT_SECRET`, restrict `CORS_ORIGINS`, serve over HTTPS
(Android release builds block plain http), and store photos in S3/Cloudinary instead of local disk.
