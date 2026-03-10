# Installing the Indeeeed Chrome Extension

## Prerequisites

- Google Chrome browser (Windows, Mac, or Linux)
- The Indeeeed backend must be running (either locally or deployed to Railway)

## Step 1: Configure the API URL

Before loading the extension, open `config.js` in the `chrome-extension` folder and set your backend URL:

```js
const INDEEEED_CONFIG = {
  API_URL: 'https://your-backend.railway.app',    // Your deployed backend URL
  DASHBOARD_URL: 'https://your-frontend.railway.app' // Your deployed frontend URL
};
```

If running locally instead, use:

```js
const INDEEEED_CONFIG = {
  API_URL: 'http://localhost:3001',
  DASHBOARD_URL: 'http://localhost:3000'
};
```

## Step 2: Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Turn on **Developer mode** (toggle in the top right corner)
3. Click **Load unpacked**
4. Navigate to and select the `chrome-extension` folder inside the Indeeeed project
5. The extension icon should appear in the Chrome toolbar

## Step 3: Pin the Extension (Optional)

1. Click the puzzle piece icon in the Chrome toolbar
2. Find "Indeed Job Application Optimizer"
3. Click the pin icon to keep it visible

## Step 4: Verify It Works

1. Click the extension icon — you should see "Backend online"
2. Navigate to any Indeed job listing page
3. A floating "Optimize My Application" button should appear in the bottom right

## Troubleshooting

- **Button not appearing?** Make sure you're on an actual Indeed job listing page (URL contains `viewjob`, `jk=`, etc.)
- **Backend offline?** Check that the backend server is running and the URL in `config.js` is correct
- **Permission errors?** Go to `chrome://extensions/`, click "Errors" under the extension, and check for details
- **After updating config.js:** Go to `chrome://extensions/` and click the refresh icon on the extension card

## Updating the Extension

After pulling new code or changing `config.js`:

1. Go to `chrome://extensions/`
2. Find "Indeed Job Application Optimizer"
3. Click the refresh (reload) icon
4. Reload any open Indeed tabs
