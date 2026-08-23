import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const BASEURL = import.meta.env.VITE_API_URL;

/* Rename this to your product name — it renders in the header. */
const APP_NAME = "Studio";

/* Provider values must match what the backend expects. */
const PROVIDERS = [
  { value: "gemini", label: "Gemini", vendor: "Google" },
  { value: "nvidia", label: "Nvidia", vendor: "NIM" },
];

/* Soft limit: the counter warns past this, but long prompts are never truncated. */
const PROMPT_LIMIT = 1000;

const HINTS = [
  "Cinematic wide shot of a rain-soaked Tokyo alley at night, neon reflections",
  "Clean flat illustration thumbnail: a rocket leaving a laptop screen",
  "Studio portrait of a golden retriever wearing headphones, soft rim light",
  "A futuristic city skyline at sunset, cinematic lighting",
  "Minimal YouTube thumbnail showing a glowing microphone",
  "Aerial view of a tropical island surrounded by clear blue water",
  "Cyberpunk gaming setup with neon lights and dramatic shadows",
  "Professional product photo of wireless headphones on a black background",
  "a macro wildlife photo of a green frog in a rainforest pond, highly detailed, eye-level shot"
];

function greatestCommonDivisor(a, b) {
  return b === 0 ? a : greatestCommonDivisor(b, a % b);
}

function formatAspect(width, height) {
  const divisor = greatestCommonDivisor(width, height) || 1;
  const w = width / divisor;
  const h = height / divisor;
  // Awkward ratios reduce to huge numbers — show a decimal instead.
  if (w > 40 || h > 40) return `${(width / height).toFixed(2)}:1`;
  return `${w}:${h}`;
}

function SparkIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M12 3l1.9 5.3L19 10l-5.1 1.7L12 17l-1.9-5.3L5 10l5.1-1.7L12 3z"
        fill="currentColor"
      />
      <path
        d="M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z"
        fill="currentColor"
        opacity="0.65"
      />
    </svg>
  );
}

function ImageIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8.75" cy="9.75" r="1.6" />
      <path d="M21 15.5l-4.6-4.1a1.6 1.6 0 00-2.2.06L4.2 20" />
    </svg>
  );
}

function DownloadIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3v12" />
      <path d="M7.5 10.5L12 15l4.5-4.5" />
      <path d="M4.5 19.5h15" />
    </svg>
  );
}

function AlertIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5" />
      <path d="M12 16.4h.01" />
    </svg>
  );
}

function App() {
  /* ---- existing state and API contract, unchanged ---- */
  const [apiProvider, setApiProvider] = useState("nvidia");
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState("");
  const [hintStartIndex, setHintStartIndex] = useState(0);




  /* ---- UI-only state ---- */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dimensions, setDimensions] = useState(null);
  const [imagePrompt, setImagePrompt] = useState("");

  const trimmedPrompt = prompt.trim();
  const canGenerate = trimmedPrompt.length > 0 && !loading;
  const overLimit = prompt.length > PROMPT_LIMIT;

  const activeProvider =
    PROVIDERS.find((p) => p.value === apiProvider) ?? PROVIDERS[0];

  const aspect = useMemo(() => {
    if (!dimensions?.width || !dimensions?.height) return null;
    return formatAspect(dimensions.width, dimensions.height);
  }, [dimensions]);

  const errorDialogRef = useRef(null);

  useEffect(() => {
    if (!error) return undefined;
    errorDialogRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setError("");
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [error]);

  const generateImage = async () => {
    if (loading || !trimmedPrompt) return; // blocks duplicate submissions
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BASEURL}/generateimage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          apiProvider,
        }),
      });
      const data = await res.json().catch(() => null);

      if (data?.imageUrl) {
        setDimensions(null);
        setImage(data.imageUrl);
        setImagePrompt(trimmedPrompt);
      } else {
        setError(
          data?.error ||
            (res.ok
              ? `${activeProvider.label} returned no image. Try rewording the prompt or switching providers.`
              : `Request failed (${res.status}). Check the backend logs and try again.`)
        );
      }
    } catch {
      setError(
        "Can't reach the image service. Confirm the backend is running, then try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = image;
    link.download = "generated-image.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  useEffect(()=> {
    const timer = setInterval(() => {
      setHintStartIndex((currentIndex)=> {
        return (currentIndex + 3) % HINTS.length;
      });
      
    }, 7000);
    return () => clearInterval(timer);
  }, [])

  const visibleHints = Array.from({ length: 3 }, (_, offset) => {
  return HINTS[(hintStartIndex + offset) % HINTS.length];
});

  const handlePromptKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      generateImage();
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <span className="brand__mark" aria-hidden="true">
              <SparkIcon className="brand__glyph" />
            </span>
            <span className="brand__name">{APP_NAME}</span>
          </div>

          <span className="topbar__rule" aria-hidden="true" />
          <h1 className="topbar__title">AI Image Generator</h1>

          <span
            className="status"
            data-busy={loading ? "true" : "false"}
            role="status"
          >
            <span className="status__dot" aria-hidden="true" />
            {loading ? "Generating" : "AI Ready"}
          </span>
        </div>
      </header>

      <main className="layout">
        {/* ---------------- Controls ---------------- */}
        <section className="panel" aria-labelledby="compose-heading">
          <div className="panel__head">
            <h2 className="panel__title" id="compose-heading">
              Compose
            </h2>
            <p className="panel__sub">
              Pick a model, describe the shot without <b>'-'</b> symbol, and generate a 16:9-ready frame.
            </p>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="provider">
              AI provider
            </label>
            <div className="select">
              <select
                id="provider"
                name="provider"
                className="select__input"
                value={apiProvider}
                onChange={(e) => setApiProvider(e.target.value)}
              >
                {PROVIDERS.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label} — {provider.vendor}
                  </option>
                ))}
              </select>
              <span className="select__chevron" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9.5l6 6 6-6" />
                </svg>
              </span>
            </div>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="prompt">
              Prompt
            </label>
            <textarea
              id="prompt"
              name="prompt"
              className="textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handlePromptKeyDown}
              placeholder="Describe the scene you want to create..."
              aria-describedby="prompt-counter prompt-help"
              spellCheck="true"
            />
            <div className="field__foot">
              <p className="field__help" id="prompt-help">
                <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to generate
              </p>
              <p
                className="counter"
                id="prompt-counter"
                data-over={overLimit ? "true" : "false"}
              >
                {prompt.length.toLocaleString()} / {PROMPT_LIMIT.toLocaleString()}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn--primary"
            onClick={generateImage}
            disabled={!canGenerate}
            aria-busy={loading ? "true" : "false"}
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Generating...
              </>
            ) : (
              <>
                <SparkIcon className="btn__icon" />
                Generate image
              </>
            )}
          </button>

          <ul className="hints">
            <li className="hints__label">Try</li>
            {visibleHints.map((hint) => (
              <li key={hint}>
                <button
                  type="button"
                  className="hint"
                  onClick={() => setPrompt(hint)}
                  disabled={loading}
                >
                  {hint}
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- Preview ---------------- */}
        <section className="panel panel--preview" aria-labelledby="preview-heading">
          <div className="panel__head panel__head--row">
            <div>
              <h2 className="panel__title" id="preview-heading">
                Preview
              </h2>
              <p className="panel__sub">Framed 16:9 for YouTube</p>
            </div>
            <span className="chip">{activeProvider.label}</span>
          </div>

          <div className="frame" data-state={loading ? "busy" : image ? "filled" : "empty"}>
            <span className="frame__crop frame__crop--tl" aria-hidden="true" />
            <span className="frame__crop frame__crop--tr" aria-hidden="true" />
            <span className="frame__crop frame__crop--bl" aria-hidden="true" />
            <span className="frame__crop frame__crop--br" aria-hidden="true" />

            {image ? (
              <img
                key={image}
                className="frame__image"
                src={image}
                alt={
                  imagePrompt
                    ? `AI generated image: ${imagePrompt}`
                    : "AI generated image"
                }
                onLoad={(e) =>
                  setDimensions({
                    width: e.currentTarget.naturalWidth,
                    height: e.currentTarget.naturalHeight,
                  })
                }
                onError={() =>
                  setError("The generated image couldn't be loaded from its URL.")
                }
              />
            ) : (
              <div className="empty">
                <span className="empty__icon" aria-hidden="true">
                  <ImageIcon />
                </span>
                <p className="empty__title">Your generated image will appear here</p>
                <p className="empty__sub">
                  Write a prompt and generate to fill this frame.
                </p>
              </div>
            )}

            {loading && (
              <div className="frame__busy">
                <span className="frame__scan" aria-hidden="true" />
                <p className="frame__busy-text">
                  <span className="spinner spinner--dim" aria-hidden="true" />
                  Rendering with {activeProvider.label}
                </p>
              </div>
            )}
          </div>

          <div className="meta">
            <dl className="meta__list">
              <div className="meta__item">
                <dt>Dimensions</dt>
                <dd>
                  {dimensions
                    ? `${dimensions.width} × ${dimensions.height}`
                    : "—"}
                </dd>
              </div>
              <div className="meta__item">
                <dt>Aspect</dt>
                <dd>{aspect ?? "—"}</dd>
              </div>
              <div className="meta__item">
                <dt>Format</dt>
                <dd>{image ? "PNG" : "—"}</dd>
              </div>
            </dl>

            <button
              type="button"
              className="btn btn--download"
              onClick={downloadImage}
              disabled={!image}
            >
              <DownloadIcon className="btn__icon" />
              Download image
            </button>
          </div>
        </section>
      </main>

      {/* ---------------- Error modal ---------------- */}
      <div className="modal-region" aria-live="assertive" aria-atomic="true">
        {error && (
          <div className="modal-backdrop" onMouseDown={() => setError("")}>
          <div
            className="error-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="error-modal-title"
            aria-describedby="error-modal-description"
            tabIndex="-1"
            ref={errorDialogRef}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span className="error-modal__icon" aria-hidden="true">
              <AlertIcon />
            </span>
            <div className="error-modal__body">
              <p className="error-modal__eyebrow">Unable to generate</p>
              <h2 className="error-modal__title" id="error-modal-title">Generation failed</h2>
              <p className="error-modal__text" id="error-modal-description">{error}</p>
              <button type="button" className="btn error-modal__action" onClick={() => setError("")}>Close</button>
            </div>
            <button
              type="button"
              className="error-modal__close"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
