# Cardex PWA — Setup Guide

Cardex is an offline-first loyalty card wallet. To install it on your phone, you need to host it over HTTPS. Here are three easy options:

---

## Option 1: GitHub Pages (Free, Recommended)

1. Create a free account at [github.com](https://github.com)
2. Create a new repository named `cardex`
3. Upload all files from the `cardex/` folder (drag & drop in the GitHub web UI)
4. Go to **Settings → Pages → Source → main branch → / (root)** → Save
5. Your app will be live at `https://yourusername.github.io/cardex/`
6. Open that URL on your phone and install:
   - **Android**: tap the "Install Cardex" banner, or Menu → "Add to Home Screen"
   - **iPhone/iPad**: tap Share → "Add to Home Screen"

---

## Option 2: Netlify (Free, Drag & Drop)

1. Go to [netlify.com](https://netlify.com) and sign up free
2. Drag the entire `cardex/` folder onto the Netlify dashboard
3. Get an instant HTTPS URL like `https://cardex-abc123.netlify.app`
4. Open on phone and install as above

---

## Option 3: Local HTTPS with ngrok (Quick Test)

```bash
# Serve locally
cd cardex
python3 -m http.server 8080

# In another terminal, expose over HTTPS
npx ngrok http 8080
```
Open the ngrok URL on your phone to test.

---

## File Structure

```
cardex/
├── index.html        ← Main app (React, all-in-one)
├── manifest.json     ← PWA metadata
├── sw.js             ← Service worker (offline caching)
└── icons/
    ├── icon-192.png  ← Android icon
    ├── icon-512.png  ← Android splash / store
    └── apple-touch-icon.png  ← iPhone home screen icon
```

---

## What works offline

Everything except:
- Location detection (requires network for reverse geocoding)
- First load of JS libraries (cached after first visit)

All card data is stored in your browser's localStorage — no server, no account needed.
