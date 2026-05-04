# ✉️ Tone Transformer — AI Email Rewriter

> Turn rough messages into polished communication using AI.

---

## 📁 Project Structure

```
tone-transformer/
├── backend/
│   ├── routes/
│   │   └── ai.js          ← POST /ai/rewrite endpoint
│   ├── server.js          ← Express server
│   ├── package.json
│   └── .env               ← ⚠️ Add your OpenAI API key here
│
└── frontend/
    ├── src/
    │   ├── App.jsx        ← Main React UI
    │   ├── App.css        ← Styles
    │   ├── main.jsx       ← React entry point
    │   └── index.css      ← Global reset
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── .env               ← Backend URL config
```

---

## 🚀 How to Run (Step by Step)

### Step 1 — Add your OpenAI API Key

Open `backend/.env` and replace the placeholder:

```
OPENAI_API_KEY=your_openai_api_key_here
```

Get your key from: https://platform.openai.com/api-keys

---

### Step 2 — Setup & Run Backend

Open a terminal and run:

```bash
cd backend
npm install
npm run dev
```

You should see:
```
Server running on http://localhost:5000
```

---

### Step 3 — Setup & Run Frontend

Open a **second terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

You should see:
```
Local: http://localhost:5173/
```

Open http://localhost:5173 in your browser. Done! ✅

---

## 🧠 JS Concepts Used (Assessment Requirements)

| Concept | Where Used |
|---------|-----------|
| `map()` | `backend/routes/ai.js` — tone config; `frontend/src/App.jsx` — dropdown render |
| `reduce()` | `backend/routes/ai.js` — prompt builder |
| Loop (`for`) | `backend/routes/ai.js` & `App.jsx` — validation checks |

---

## 🔥 Features

- ✅ Textarea for message input
- ✅ Tone selection: Professional, Friendly, Apologetic, Confident
- ✅ POST `/ai/rewrite` endpoint
- ✅ Displays original + rewritten message
- ✅ Copy to clipboard button
- ✅ Error handling: empty message, invalid tone, API failure, long input
- ✅ Ctrl+Enter shortcut to rewrite

---

## 🛠 Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **AI:** OpenAI GPT-3.5-turbo
