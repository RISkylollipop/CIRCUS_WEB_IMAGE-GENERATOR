# Circus AI Image Generator

Circus is a React and Express application for generating YouTube-ready images from text prompts. The frontend provides a 16:9 composition workspace, provider selection, rotating prompt examples, image preview, image metadata, and PNG download. The backend calls NVIDIA's image generation API and returns the generated image as a data URL.

## Features

- Text-to-image generation from a natural-language prompt
- NVIDIA image generation provider integration
- YouTube-friendly 16:9 preview frame
- Prompt length counter and keyboard shortcut support
- Rotating, selectable prompt examples
- Generated image dimensions, aspect ratio, and format metadata
- PNG download action
- Accessible error modal with Escape and backdrop dismissal
- SEO metadata and WebApplication structured data
- Structured backend info and error logs

## Tech Stack

- Frontend: React 19, Vite 8
- Backend: Node.js, Express 5
- Image generation: NVIDIA AI API
- Runtime configuration: dotenv

## Prerequisites

- Node.js 18 or newer
- npm
- An NVIDIA image-generation API key

## Installation

Install dependencies from the project root:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

## Environment Variables

Create or update `backend/.env`:

```env
PORT=3300
CLIENT_ORIGIN=http://localhost:5173
IMAGEGENKEY=your_nvidia_api_key
```

Create or update `frontend/.env`:

```env
VITE_API_URL=http://localhost:3300
```

Do not commit API keys or other secrets. The frontend variable must contain the backend base URL without the `/generateimage` path because the application appends that route.

## Development

Start both services from the project root:

```bash
npm run dev
```

Or start them independently:

```bash
npm run backend
npm run frontend
```

The frontend is normally available at `http://localhost:5173` and the backend at `http://localhost:3300`.

## Deploying Frontend and API Together on Vercel

This repository is configured as a single Vercel project. `vercel.json` builds the Vite frontend from `frontend/` and `api/generateimage.js` exposes the image-generation endpoint as a Vercel serverless function.

In Vercel, use the repository root as the project root. The checked-in configuration provides these values:

```text
Build Command: cd frontend && npx vite build
Output Directory: frontend/dist
Install Command: npm install && npm --prefix frontend install && npm --prefix backend install
```

For the combined deployment, leave `VITE_API_URL` empty or unset. The frontend then calls `/api/generateimage` on the same Vercel domain. Set these Vercel environment variables:

```env
IMAGEGENKEY=your_nvidia_api_key
CLIENT_ORIGIN=https://your-project.vercel.app
```

`PORT` is only needed for local backend development. Vercel does not run `backend/server.js` with `app.listen()`; it imports the exported Express app through `api/generateimage.js`.

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

The API returns a JSON `error` message with an appropriate HTTP status when the provider, prompt, or generation request is invalid.

## Quality Checks

Run the frontend production build:

```bash
cd frontend
npx vite build
cd ..
```

Run the frontend linter:

```bash
npm --prefix frontend run lint
```

## Logging

The backend writes newline-delimited JSON logs at runtime:

- `backend/logs/info.log` for requests and startup events
- `backend/logs/error.log` for generation failures and error context

These files are runtime artifacts and should not be committed.

## Project Structure

```text
.
├── backend/
│   ├── logger/
│   │   ├── errorLogger.js
│   │   └── infoLogger.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── index.html
│   └── package.json
└── package.json
```

## Notes

- The current backend implementation supports the `nvidia` provider. The frontend lists Gemini as a future provider option, but it is not implemented by the backend yet.
- Generated images are held in browser state and are not persisted by the backend.
