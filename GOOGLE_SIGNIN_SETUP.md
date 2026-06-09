# Google Sign-In Setup (Firebase)

## Prerequisites
- A Firebase account (free Spark plan is fine)
- Your Android **debug SHA-1** fingerprint (see below)

---

## Step 1 — Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. **Add project** → name it `amparo`
3. Disable Google Analytics (optional for MVP) → **Create project**

---

## Step 2 — Enable Google Sign-In

1. In the Firebase console: **Authentication → Sign-in method**
2. Click **Google** → toggle **Enable** → save
3. This auto-creates a **Web client** under Google Cloud.
   Copy the **Web client ID** — you'll need it as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.

---

## Step 3 — Add the Android app

1. Firebase console → **Project Overview → Add app → Android**
2. **Android package name**: `com.amparo.app`
3. **SHA-1 fingerprint** (debug):
   ```bash
   # In your local amparo-app folder after running expo prebuild:
   cd android && ./gradlew signingReport
   # Copy the SHA1 from the "debug" variant
   ```
4. Download **`google-services.json`** → place at the **repo root** (`amparo-app/google-services.json`)

---

## Step 4 — Add the iOS app

1. Firebase console → **Project Overview → Add app → iOS**
2. **iOS bundle ID**: `com.amparo.app`
3. Download **`GoogleService-Info.plist`** → place at the **repo root** (`amparo-app/GoogleService-Info.plist`)
4. Open `GoogleService-Info.plist` and copy the value of `REVERSED_CLIENT_ID`
   (format: `com.googleusercontent.apps.XXXXXXXXXX`)
5. In `app.json`, replace `PLACEHOLDER_REVERSED_IOS_CLIENT_ID` in the
   `@react-native-google-signin/google-signin` plugin with that value:
   ```json
   ["@react-native-google-signin/google-signin", {
     "iosUrlScheme": "com.googleusercontent.apps.XXXXXXXXXX"
   }]
   ```
6. Copy the **iOS client ID** (`CLIENT_ID` in the plist, or Firebase → Project Settings
   → iOS app → Client ID) → use as `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`.

---

## Step 5 — Configure Supabase

The backend verifies the idToken via Supabase, not directly against Google.
Supabase needs the same Web client ID to validate the token audience:

1. **Supabase Dashboard → Authentication → Providers → Google → Enable**
2. Paste the **Web client ID** (from Step 2) into the **Client ID** field
3. Paste the corresponding **Client Secret** (found in Google Cloud Console →
   APIs & Services → Credentials → the Web client) into **Client Secret**
4. Save

---

## Step 6 — Update your `.env`

```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<Web client ID from Step 2>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<iOS client ID from Step 4>
EXPO_PUBLIC_API_URL=https://<your-vercel-domain>
```

Also set `GOOGLE_CLIENT_ID=<Web client ID>` in your Vercel environment variables.

---

## Step 7 — Rebuild native

```bash
npx expo prebuild          # regenerates android/ and ios/ with the new config
yarn android               # or yarn ios
```

---

## Quick checklist

- [ ] `google-services.json` at repo root
- [ ] `GoogleService-Info.plist` at repo root
- [ ] `iosUrlScheme` in `app.json` set to `REVERSED_CLIENT_ID`
- [ ] `.env` has both Google client IDs
- [ ] Supabase Google provider enabled with the Web client ID
- [ ] Vercel env var `GOOGLE_CLIENT_ID` set
- [ ] `expo prebuild` re-run after changes
