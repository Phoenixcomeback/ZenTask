
# ZenTask AI - Premium Productivity Hub

ZenTask is a high-performance, AI-powered task manager designed for zero-distraction focus.

## 🚀 How to Run Locally

This app uses modern ES6 modules. To avoid "CORS" errors, you **must** run it using a local web server.

### Method 1: VS Code (Recommended)
1. Open the unzipped folder in **VS Code**.
2. Install the **"Live Server"** extension by Ritwick Dey.
3. Click the **"Go Live"** button in the bottom right corner of VS Code.

### Method 2: Using Terminal
```bash
# If you have Node.js
npx serve .

# If you have Python
python -m http.server 8000
```

---

## 🔑 Personal Deployment (GitHub Pages / Vercel)

If you are hosting this app for your own use on GitHub, follow these steps to keep the AI working:

1. **Get an API Key**: Visit [Google AI Studio](https://aistudio.google.com/) and create a free Gemini API key.
2. **Setup .env**: Create a file named `.env` in your project root.
   ```env
   API_KEY=your_key_here
   ```
3. **Using a Build Tool**: For GitHub Pages, it is recommended to use **Vite**. Install it (`npm install vite`), and move your files into a `src` folder. Vite will automatically swap `process.env.API_KEY` with your real key during the build.
4. **GitHub Secrets**: If you use GitHub Actions to deploy, add your `API_KEY` to **Settings > Secrets and Variables > Actions**.

---

## 🍏 Native macOS Experience

You can convert ZenTask into a real macOS app in seconds:
1. Open the app in **Safari**.
2. Go to `File -> Add to Dock...`.
3. Open ZenTask from your **Launchpad** like a native application.

## Core Features
- **AI Smart Scheduler**: Natural language task entry (e.g., "Physics 3 hours by 12 May").
- **Project Matrix**: Detailed task management with AI subtask generation.
- **Strategic Timeline**: Visual calendar view of upcoming deadlines.
- **Executive Analytics**: Quantitative tracking of focus hours.
