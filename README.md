# 🤖 AI Interview Simulator

A full-stack AI-powered DSA interview simulator that replicates real coding interview experiences — not just a problem bank, but an actual interview environment with live feedback, stress mode, and conversational follow-ups.
- Website link: https://ai-interview-9v2o-git-main-vidushi1.vercel.app/

## ✨ Features

- **Company-based problems** — Get problems styled after Google, Amazon, Microsoft, Meta, Apple, Flipkart and more
- **Live code execution** — Write Python, run against test cases, see pass/fail instantly
- **FAANG-style scorecard** — Scored on Problem Understanding, Approach, Code Quality, Optimization Awareness with a Hire / No Hire signal
- **Stress mode** — Countdown timer with AI pings at 50%, 20%, and 10% time remaining — just like a real interview
- **Interviewer conversation** — Post-submit follow-up chat where the AI asks "What's your time complexity?", "What if the array was sorted?" — simulating the back-and-forth of a real interview round

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + Monaco Editor |
| Backend | Flask + Python |
| AI | Groq API (llama-3.3-70b-versatile) |
| Code Execution | Sandboxed subprocess (Python) |

## 📁 Project Structure

```
AI_INTERVIEW/
├── backend/
│   ├── app.py          # Flask routes
│   ├── judge.py        # Code execution sandbox
│   ├── prompts.py      # LLM prompt templates
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   └── components/
    │       ├── ProblemPanel.jsx
    │       ├── Editor.jsx
    │       ├── TestResults.jsx
    │       ├── FeedbackPanel.jsx
    │       └── InterviewerChat.jsx
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- [Groq API key](https://console.groq.com) (free)

### Backend
```bash
cd backend
pip install -r requirements.txt
set GROQ_API_KEY=your_key_here   # Windows
# export GROQ_API_KEY=your_key_here  # Mac/Linux
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` and start practicing!

## 🎯 How It Works

1. Select a **company**, **topic**, and **difficulty**
2. Get an AI-generated problem styled for that company
3. Write your solution in the Monaco editor
4. Run against test cases — see which pass/fail
5. Get a **FAANG-style scorecard** with hire signal
6. Chat with the **AI interviewer** for follow-up questions

## 📸 Screenshots

> Add screenshots here after deployment

## 🔮 Roadmap

- [ ] Voice mode — explain your approach out loud, AI judges communication
- [ ] Session history — track progress over time
- [ ] More languages — JavaScript, Java, C++
- [ ] Leaderboard

## 👩‍💻 Author

Built by [Vidushi Kochhar](https://github.com/vidushikochharug24-sud) — ECE @ NSUT Delhi
