# WrenchBook — free Android installation

This version adds installable PWA support while keeping the existing React app, Express API, local browser storage, PDF generation, repair guide, vehicle lookup, customer records, estimates, and scheduling.

## Deploy (free hosting tier)

1. Create a **public** GitHub repository named `WrenchBook`. (Your existing public repository is fine.)
2. Extract this ZIP on your phone. Open the extracted `wrenchbook` folder, then upload everything inside that folder to the top level of your GitHub repository. Do not upload the ZIP itself or the outer `wrenchbook` folder as a single nested folder. Do not upload `.env` files or API keys.
3. Create a free web service on Render and connect your `WrenchBook` repository.
4. Render should detect `render.yaml` at the repository top level. Confirm the service uses the Free plan before deploying.
5. In the service's Environment settings, add `GEMINI_API_KEY` with your Gemini API key. Keep it private; never put it in frontend code or commit it to GitHub.
6. Deploy. Wait for the service to finish building, then open its `https://…onrender.com` address.

The free web-service tier may sleep after inactivity and can take time to wake. Gemini requests require internet and are subject to Google's API availability, model access, and any applicable free-tier limits. Hosting is free-tier, not a promise that every AI request is free or unlimited.

## Install on Samsung Android / Chrome

1. Open the deployed HTTPS address in Chrome.
2. Tap Chrome's three-dot menu.
3. Tap **Install app** (or **Add to Home screen**, depending on Chrome version).
4. Confirm **Install**. WrenchBook will appear in the app drawer and can be added to the home screen.

## Data and offline behavior

Customer records, saved jobs, shop rates, appointments, and the active vehicle are stored in that browser's local storage on that phone. They are not automatically synced to another phone or browser. Do not clear Chrome site data unless you have exported/backed up anything important. The PWA caches its app shell and static assets, but Gemini vehicle/repair lookups still require an internet connection.

## Local test

- `npm install`
- Copy `.env.example` to `.env` and set `GEMINI_API_KEY` (only needed for AI lookup features)
- `npm run build`
- `npm start`
- Open `http://localhost:3000`


## Important limits

Render Free web services can spin down after 15 minutes without traffic and may take about a minute to wake. Free services have ephemeral filesystems, so WrenchBook customer/job data stays in the browser storage on your phone, not on the server. AI lookups call the Gemini API and may have separate usage limits or charges depending on your Google API account. Do not enter payment details or upgrade a plan unless you choose to.
