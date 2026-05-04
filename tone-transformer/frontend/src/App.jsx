import { useState } from "react";
import axios from "axios";
import "./App.css";

// ─────────────────────────────────────────
// MANDATORY JS CONCEPT: map() — Tone config
// ─────────────────────────────────────────
const TONES = ["professional", "friendly", "apologetic", "confident"];
const toneOptions = TONES.map((t) => ({
  value: t,
  label: t.charAt(0).toUpperCase() + t.slice(1),
}));

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("professional");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [copied, setCopied] = useState("");

  // ─────────────────────────────────────────
  // Loop — Client-side validation
  // ─────────────────────────────────────────
  function clientValidate(msg, selectedTone) {
    const errs = [];
    const checks = [
      { condition: !msg.trim(), error: "Please enter a message." },
      {
        condition: msg.trim().length > 2000,
        error: "Message must be under 2000 characters.",
      },
      {
        condition: !TONES.includes(selectedTone),
        error: "Please select a valid tone.",
      },
    ];

    for (let i = 0; i < checks.length; i++) {
      if (checks[i].condition) errs.push(checks[i].error);
    }

    return errs;
  }

  async function handleRewrite() {
    setErrors([]);
    setResult(null);
    setCopied("");

    const validationErrors = clientValidate(message, tone);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/ai/rewrite`, {
        message: message.trim(),
        tone,
      });

      if (response.data.success) {
        setResult(response.data);
      }
    } catch (err) {
      const serverErrors = err.response?.data?.errors || [
        err.response?.data?.error || "Something went wrong. Please try again.",
      ];
      setErrors(serverErrors);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }

  function handleKeyDown(e) {
    if (e.ctrlKey && e.key === "Enter") {
      handleRewrite();
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-icon">✉️</div>
        <h1>Tone Transformer</h1>
        <p>Turn rough messages into polished communication</p>
      </header>

      <main className="main">
        <div className="card input-card">
          <h2>Your Message</h2>

          <textarea
            className="textarea"
            rows={6}
            placeholder='e.g. "hey, I didn't finish the work. will do later."'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={2000}
          />
          <div className="char-count">
            <span className={message.length > 1800 ? "warn" : ""}>
              {message.length}
            </span>{" "}
            / 2000
            <span className="hint"> · Ctrl+Enter to rewrite</span>
          </div>

          <div className="tone-row">
            <label htmlFor="tone-select" className="label">
              Select Tone
            </label>
            <div className="tone-pills">
              {/* map() used for rendering tone options */}
              {toneOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`tone-pill ${tone === opt.value ? "active" : ""}`}
                  onClick={() => setTone(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {errors.length > 0 && (
            <div className="error-box">
              {errors.map((e, i) => (
                <p key={i}>⚠ {e}</p>
              ))}
            </div>
          )}

          <button
            className="btn-rewrite"
            onClick={handleRewrite}
            disabled={loading}
          >
            {loading ? (
              <span className="loading-row">
                <span className="spinner" /> Rewriting...
              </span>
            ) : (
              "✨ Rewrite Message"
            )}
          </button>
        </div>

        {result && (
          <div className="results">
            <div className="card result-card original">
              <div className="card-header">
                <h3>
                  <span className="dot gray" /> Original Message
                </h3>
                <button
                  className="btn-copy"
                  onClick={() => handleCopy(result.original, "orig")}
                >
                  {copied === "orig" ? "✓ Copied!" : "Copy"}
                </button>
              </div>
              <p className="message-text">{result.original}</p>
            </div>

            <div className="arrow-divider">
              <span>↓</span>
              <span className="tone-badge">
                {result.tone.charAt(0).toUpperCase() + result.tone.slice(1)}
              </span>
              <span>↓</span>
            </div>

            <div className="card result-card rewritten">
              <div className="card-header">
                <h3>
                  <span className="dot purple" /> Rewritten Message
                </h3>
                <button
                  className="btn-copy"
                  onClick={() => handleCopy(result.rewritten, "new")}
                >
                  {copied === "new" ? "✓ Copied!" : "Copy"}
                </button>
              </div>
              <p className="message-text">{result.rewritten}</p>
            </div>

            <button
              className="btn-again"
              onClick={() => {
                setResult(null);
                setMessage("");
                setCopied("");
              }}
            >
              ↩ Rewrite Another
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
