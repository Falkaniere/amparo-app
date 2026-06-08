# Week Deploy Plan — Amparo

Goal: backend + admin live on Vercel, Google Sign-In working, Android app on Google Play by end of week.

---

## STEP 1 — Merge all open PRs
**~2 min**

- [ ] Merge **amparo-backend PR #10** → https://github.com/Falkaniere/amparo-backend/pull/10
- [ ] Merge **amparo-app PR #16** → https://github.com/Falkaniere/amparo-app/pull/16
- [ ] Merge **amparo-admin PR #1** → https://github.com/Falkaniere/amparo-admin/pull/1

---

## STEP 2 — Deploy backend to Vercel
**~10 min**

- [ ] https://vercel.com/new → import `falkaniere/amparo-backend`
- [ ] Framework preset: **Other** — leave build/output blank
- [ ] Add env vars (see `DEPLOY.md` for full list):
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `NODE_ENV=production`
  - `PAGARME_API_KEY`, `PAGARME_PLATFORM_RECIPIENT_ID`, `PLATFORM_FEE_PERCENT`
  - `EXPO_ACCESS_TOKEN`
  - `GOOGLE_CLIENT_ID` ← fill after Step 4
  - `ADMIN_SECRET` ← any long random string
- [ ] Deploy → test `https://<domain>/health` returns `{"status":"ok"}`
- [ ] Link for auto-deploy (run locally in `amparo-backend/`):
  ```bash
  npm i -g vercel && vercel link && cat .vercel/project.json
  ```
  Add to GitHub repo secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

---

## STEP 3 — Deploy admin to Vercel
**~10 min**

- [ ] https://vercel.com/new → import `falkaniere/amparo-admin`
- [ ] Framework preset: **Vite** (auto-detected)
- [ ] Add env vars:
  - `VITE_API_URL=https://<backend-vercel-domain>`
  - `VITE_ADMIN_SECRET=<same as ADMIN_SECRET above>`
- [ ] Deploy → verify admin panel loads
- [ ] Link for auto-deploy (same steps, but `cd amparo-admin && vercel link`)
  Add to GitHub repo secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

---

## STEP 4 — Firebase + Google Sign-In
**~15 min | Full guide: `GOOGLE_SIGNIN_SETUP.md`**

- [ ] https://console.firebase.google.com → **Add project** → name `amparo`
- [ ] **Authentication → Sign-in method → Google → Enable**
  - Copy the **Web client ID** (needed in 3 places)
- [ ] **Add Android app** (package: `com.amparo.app`)
  - Get SHA-1 (run locally after `npx expo prebuild`):
    ```bash
    cd android && ./gradlew signingReport
    # copy SHA1 from the "debug" variant
    ```
  - Download `google-services.json` → place at `amparo-app/` root
- [ ] **Add iOS app** (bundle: `com.amparo.app`)
  - Download `GoogleService-Info.plist` → place at `amparo-app/` root
  - Copy `REVERSED_CLIENT_ID` from the plist
  - In `app.json` replace `PLACEHOLDER_REVERSED_IOS_CLIENT_ID` with that value
- [ ] **Supabase** → Authentication → Providers → Google → Enable
  - Paste **Web client ID** + **Client Secret** (from Google Cloud Console)
- [ ] Update `amparo-app/.env`:
  ```
  EXPO_PUBLIC_API_URL=https://<backend-vercel-domain>
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<Web client ID>
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<iOS client ID from plist>
  ```
- [ ] Update Vercel backend: add `GOOGLE_CLIENT_ID=<Web client ID>`
- [ ] Add Firebase files as GitHub secrets for CI builds:
  - `GOOGLE_SERVICES_JSON` → paste the full contents of `google-services.json`
  - `GOOGLE_SERVICE_INFO_PLIST` → paste the full contents of `GoogleService-Info.plist`

---

## STEP 5 — EAS account + Android build
**~20 min (build itself runs in the cloud ~15 min)**

- [ ] Create Expo account if needed: https://expo.dev/signup
- [ ] Run locally in `amparo-app/`:
  ```bash
  npm i -g eas-cli
  eas login
  eas build:configure    # links project to your Expo account
  ```
- [ ] Add `EXPO_TOKEN` to GitHub repo secrets (expo.dev → Account → Access Tokens)
- [ ] **Preview build first** (direct-install APK, no Play Store needed):
  ```bash
  eas build --platform android --profile preview
  ```
  Install on your Android device → test Google Sign-In end-to-end
- [ ] Once sign-in works → **Production build** (AAB for Play Store):
  ```bash
  eas build --platform android --profile production
  ```
  Download the `.aab` from https://expo.dev/accounts/[you]/builds

---

## STEP 6 — Google Play Store
**~30 min setup + 1–3 days review**

- [ ] https://play.google.com/console → **Create app**
  - App name: `Amparo`
  - Default language: `Portuguese (Brazil)`
  - Free app
- [ ] Complete store listing:
  - Short description (80 chars max)
  - Full description
  - At least 2 phone screenshots
  - Feature graphic (1024×500 px)
  - App icon (512×512 px) — use `assets/images/icon.png`
- [ ] **Internal testing track first** (review in minutes):
  - Testing → Internal testing → Create new release
  - Upload the `.aab` from Step 5
  - Add yourself as tester → install via testing link → verify everything
- [ ] When happy → promote to **Production** → submit for review (1–3 business days)

---

## Suggested timeline

| Day | Steps |
|-----|-------|
| **Mon** | 1 + 2 + 3 — all servers live |
| **Tue** | 4 — Google Sign-In working end-to-end |
| **Wed** | 5 — preview APK on device, sign-in tested |
| **Thu** | 6 — store listing + internal testing build |
| **Fri** | Promote to production + submit |

---

## GitHub secrets checklist (all repos)

### amparo-backend + amparo-admin
| Secret | Value |
|--------|-------|
| `VERCEL_TOKEN` | from vercel.com/account/tokens |
| `VERCEL_ORG_ID` | from `vercel link` → `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | from `vercel link` → `.vercel/project.json` |

### amparo-app
| Secret | Value |
|--------|-------|
| `EXPO_TOKEN` | from expo.dev → Account → Access Tokens |
| `GOOGLE_SERVICES_JSON` | full contents of `google-services.json` |
| `GOOGLE_SERVICE_INFO_PLIST` | full contents of `GoogleService-Info.plist` |
