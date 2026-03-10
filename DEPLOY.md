# Deploying Indeeeed Optimizer to Railway

This guide walks you through deploying the backend API, frontend dashboard, and Chrome extension.

---

## Architecture

```
[Chrome Extension] --> [Backend API (Railway)] <-- [Frontend Dashboard (Railway)]
    (Indeed.com)        (Node.js + Express)         (React static build)
                         |
                         v
                      [OpenAI GPT-4o]
```

You'll create **two Railway services** from the same GitHub repo, each pointing to a different folder.

---

## Step 1: Create a Railway Account

1. Go to [railway.com](https://railway.com) and sign up (GitHub login works)
2. Create a new project

---

## Step 2: Deploy the Backend

1. In your Railway project, click **"New Service"** > **"GitHub Repo"**
2. Select your `Application-Application-app` repository
3. Railway will auto-detect the project. You need to tell it to use the `backend` folder:
   - Go to **Settings** > **Source** > set **Root Directory** to `backend`
4. Go to the **Variables** tab and add:

   | Variable | Value |
   |----------|-------|
   | `OPENAI_API_KEY` | `sk-proj-your-actual-key-here` |
   | `PORT` | `3001` (Railway auto-sets this, but add it to be safe) |

5. Click **Deploy**
6. Once deployed, go to **Settings** > **Networking** > **Generate Domain**
7. Copy your backend URL (e.g., `https://indeeeed-backend-production.up.railway.app`)

---

## Step 3: Deploy the Frontend

1. In the same Railway project, click **"New Service"** > **"GitHub Repo"**
2. Select the same repository again
3. Set **Root Directory** to `frontend`
4. Go to the **Variables** tab and add:

   | Variable | Value |
   |----------|-------|
   | `REACT_APP_API_URL` | `https://your-backend-url.railway.app` (the URL from Step 2) |

5. Click **Deploy**
6. Once deployed, go to **Settings** > **Networking** > **Generate Domain**
7. Copy your frontend URL (e.g., `https://indeeeed-frontend-production.up.railway.app`)

---

## Step 4: Update the Chrome Extension

1. Open `chrome-extension/config.js` in a text editor
2. Replace the placeholder URLs with your actual Railway URLs:

   ```js
   const INDEEEED_CONFIG = {
     API_URL: 'https://your-backend-url.railway.app',
     DASHBOARD_URL: 'https://your-frontend-url.railway.app'
   };
   ```

3. Load or reload the extension in Chrome (see `chrome-extension/INSTALL.md` for full instructions)

---

## Step 5: Verify Everything Works

1. Open the frontend URL in your browser — you should see the Indeeeed dashboard
2. Upload your master resume through the dashboard
3. Go to an Indeed job listing in Chrome
4. The floating "Optimize My Application" button should appear
5. Click it — the optimization should run against your deployed backend
6. Check the dashboard for results

---

## Environment Variables Reference

### Backend (`backend/`)

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key for GPT-4o calls |
| `PORT` | No | Server port (Railway sets this automatically) |

### Frontend (`frontend/`)

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_URL` | Yes | Full URL of the deployed backend (e.g., `https://xxx.railway.app`) |

---

## Troubleshooting

### Backend won't start
- Check the Railway deploy logs for errors
- Make sure `OPENAI_API_KEY` is set correctly in Variables
- Verify the Root Directory is set to `backend`

### Frontend shows "Backend offline"
- Make sure `REACT_APP_API_URL` points to the correct backend URL
- The backend must be fully deployed before the frontend can reach it
- Check that the backend URL includes `https://` (not `http://`)

### Chrome extension can't reach backend
- Verify `config.js` has the correct Railway backend URL
- Reload the extension at `chrome://extensions/` after editing `config.js`
- Check Chrome DevTools console on the Indeed page for errors

### CORS errors
- The backend already allows all origins via `cors()` middleware
- If you see CORS errors, make sure you're hitting the correct URL (no trailing slash)

### Resume/history lost after redeploy
- Railway uses an ephemeral filesystem — uploaded files and optimization history are lost on each deploy
- For persistent storage, consider adding a Railway volume or using a database in a future version

---

## Running Locally Instead

If you prefer to run locally:

1. **Backend**: `cd backend && npm install && npm start` (runs on port 3001)
2. **Frontend**: `cd frontend && npm install && npm start` (runs on port 3000)
3. **Extension**: Set `config.js` URLs to `http://localhost:3001` and `http://localhost:3000`

Make sure you have a `.env` file in the `backend` folder with your `OPENAI_API_KEY`.

---

## Cost Notes

- **Railway**: Free tier gives you $5/month of usage, which is plenty for personal use
- **OpenAI**: Each optimization uses ~3-4 GPT-4o API calls. With auto-retry, worst case is ~12 calls per job. Budget roughly $0.05-0.15 per optimization depending on description length
