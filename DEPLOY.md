# Medi-Assist — Deployment Guide

Three services, three platforms, all free tier.

---

## Architecture Overview

```
Browser ──► Vercel (React client)
                │
                ▼
         Render (Express API :3001)
                │
                ├──► MongoDB Atlas
                ├──► Gemini API
                └──► Render (Flask ML service :5001)
```

---

## 1. MongoDB Atlas (do this first)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) → Create free cluster (M0)
2. Database Access → Add a user (username + password, save these)
3. Network Access → Add IP: `0.0.0.0/0` (allow all — needed for Render)
4. Connect → Drivers → copy the connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/mediassist?retryWrites=true&w=majority
   ```
5. Save this string — you'll need it for the Express env vars

---

## 2. Flask ML Service on Render

**New Web Service → Connect your GitHub repo**

| Setting | Value |
|---------|-------|
| **Root Directory** | `ml_service` |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `python ml_server.py` |
| **Instance Type** | Free |

**Environment Variables:**
| Key | Value |
|-----|-------|
| `ML_PORT` | `5001` |
| `PYTHON_VERSION` | `3.11.0` |

After deploy, copy the service URL (e.g. `https://medi-assist-ml.onrender.com`) — you'll need it for Express.

---

## 3. Express API on Render

**New Web Service → Same repo**

| Setting | Value |
|---------|-------|
| **Root Directory** | `server` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node index.js` |
| **Instance Type** | Free |

**Environment Variables:**
| Key | Value |
|-----|-------|
| `PORT` | `3001` |
| `MONGO_URI` | *(your Atlas connection string from step 1)* |
| `JWT_SECRET` | *(any long random string, e.g. 64 hex chars)* |
| `GEMINI_API_KEY` | *(from Google AI Studio)* |
| `ML_SERVICE_URL` | *(your Flask service URL from step 2)* |
| `CLIENT_URL` | *(your Vercel URL from step 4 — add after deploy)* |
| `NODE_ENV` | `production` |

After deploy, copy the service URL (e.g. `https://medi-assist-api.onrender.com`)

---

## 4. React Client on Vercel

1. Go to [https://vercel.com](https://vercel.com) → New Project → Import from GitHub
2. **Root Directory:** `client`
3. **Framework:** Vite (auto-detected)
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`

**Environment Variables:**
| Key | Value |
|-----|-------|
| `VITE_API_URL` | *(your Express Render URL from step 3)* |

> **Note:** The `client/vercel.json` already handles SPA routing — no 404s on `/predict`, `/chat` etc.

After deploy, go back to your **Express service on Render** and update `CLIENT_URL` to the Vercel URL.

---

## 5. After All Three Are Live

1. Test the health checks:
   - `GET https://medi-assist-api.onrender.com/api/health`
   - `GET https://medi-assist-ml.onrender.com/ml/health`
2. Register a new user → run a prediction → verify PDF downloads
3. Update `Developer.jsx` line 64 with your real Vercel URL

---

## ⚠️ Free Tier Caveats

- **Render free instances sleep after 15 minutes of inactivity** — the first request after sleeping takes ~30 seconds
- MongoDB Atlas M0 free tier: 512MB storage limit
- To avoid cold starts: use [UptimeRobot](https://uptimerobot.com) to ping `/api/health` every 14 minutes (free)
