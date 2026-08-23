# Circus AI Image Generator

Circus is a React and Express application for generating YouTube-ready images from text prompts. The frontend provides a 16:9 composition workspace, provider selection, rotating prompt examples, image preview, image metadata, PNG download, and an accessible error modal. The backend sends image-generation requests to NVIDIA's API and returns the generated image as a data URL.

## Features

- NVIDIA text-to-image generation
- YouTube-friendly 16:9 preview frame
- Three rotating, selectable prompt examples
- Prompt counter and `Ctrl`/`Cmd` + `Enter` generation shortcut
- Image dimensions, aspect ratio, and PNG download
- Accessible error modal with Escape and backdrop dismissal
- SEO, Open Graph, Twitter Card, and WebApplication metadata
- Structured newline-delimited backend info and error logs

## Tech Stack

- Frontend: React 19 and Vite 8
- Backend: Node.js and Express 5
- Image provider: NVIDIA AI API
- Configuration: dotenv

## Prerequisites

- Node.js 18 or newer
- npm
- An NVIDIA image-generation API key

## Installation

From the repository root:

```bash
npm install
npm --prefix frontend install
npm --prefix backend install
```

## Environment Variables

Create `backend/.env`:

```env
PORT=3300
CLIENT_ORIGIN=http://localhost:5173
IMAGEGENKEY=your_nvidia_api_key
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3300
```

Do not commit `.env` files or expose the NVIDIA key in frontend code. `VITE_API_URL` should be the backend base URL only; the frontend appends `/generateimage`.

## Local Development

Start frontend and backend together:

```bash
npm run dev
```

Or start them separately:

```bash
npm run frontend
npm run backend
```

The default URLs are `http://localhost:5173` for the frontend and `http://localhost:3300` for the backend.

## API

### `POST /generateimage`

Request body:

```json
{
  "apiProvider": "nvidia",
  "prompt": "Cinematic wide shot of a rain-soaked Tokyo alley at night, neon reflections"
}
```

Successful response:

```json
{
  "imageUrl": "data:image/png;base64,..."
}
```

The endpoint returns a JSON `error` field for invalid input, unsupported providers, provider failures, and other generation errors. The backend currently implements `nvidia`; the Gemini option in the frontend is not implemented by the backend.

## Frontend-Only Vercel Deployment

The checked-in [vercel.json](vercel.json) deploys only the Vite frontend. Host the Express backend separately and set `VITE_API_URL` in Vercel to the backend's public HTTPS URL:

```env
VITE_API_URL=https://your-backend-domain.com
```

Vercel settings:

```text
Build Command: cd frontend && npx vite build
Output Directory: frontend/dist
Install Command: npm install && npm --prefix frontend install
```

The separately hosted backend must allow the Vercel frontend origin through `CLIENT_ORIGIN` and define `IMAGEGENKEY` and `PORT` in its own environment.

## Logging

Logger modules:

- `backend/logger/infoLogger.js`
- `backend/logger/errorLogger.js`

Runtime logs are written as newline-delimited JSON to `backend/logs/info.log` and `backend/logs/error.log`. The logs directory is ignored by Git and created automatically.

## Quality Checks

```bash
cd frontend
npx eslint .
npx vite build
```

Use `npx vite build` directly because the current frontend `build` script is self-referential.

## Project Structure

```text
.
├── backend/
│   ├── logger/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   └── package.json
├── vercel.json
└── package.json
```
