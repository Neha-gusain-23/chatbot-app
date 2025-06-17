zerocode-chatbot/
src/app/api/ – Contains all API routes like authentication and user endpoints (used by Next.js backend functions).

src/app/analytics/ – The dashboard section of the app showing analytics or chat stats.

src/app/components/ – All UI components used throughout the app.

ui/ – Reusable, styled UI elements like buttons, inputs, toggles, etc.

PromptTemplates.tsx – Pre-filled prompts to assist users while chatting.

ThemeToggle.tsx – Component to switch between light and dark themes.

VoiceInput.tsx – Enables voice-to-text functionality inside the chatbot.

src/app/contexts/ – Contains React Context providers, like ThemeContext.

src/app/lib/ – Core logic related to auth, analytics, or custom server-side functions.

src/app/utils/ – Utility functions like exporting chat as PDF or transforming data.

src/app/globals.css – Tailwind CSS styles and any global styles for the app.

src/app/layout.tsx – Global layout file for page structure and providers.

src/app/page.tsx – The main chatbot interface shown to users.

public/ – Static assets such as images, icons, and favicon.

types/ – Centralized folder for global TypeScript types and interfaces.

package.json – Manages project dependencies and scripts.

tailwind.config.js – Tailwind CSS custom configuration.

tsconfig.json – TypeScript configuration for compiler rules and paths.

README.md – Project overview, documentation, and instructions.




---

 Key Files & Their Roles

 `src/app/page.tsx`
- Main chat UI: Handles authentication, chat logic, input history, auto-scroll, and voice input.
- Integrates analytics: Tracks every message for dashboard.

### `src/app/analytics/page.tsx`
- Analytics dashboard: Shows real-time stats, charts, and performance metrics.
- Uses analytics tracker: Reads from localStorage for live data.

### `src/lib/analytics.ts`
- Analytics logic: Tracks messages, calculates stats, analyzes topics, and persists data.
- Methods: `addUserMessage`, `addBotMessage`, `getAnalytics`, `resetAnalytics`.

### `src/components/ThemeToggle.tsx`
- Theme switcher: Sun/moon icon, toggles light/dark mode, persists preference.

### `src/components/VoiceInput.tsx`
- Voice input: Uses Web Speech API, handles browser compatibility, error states.

### `src/contexts/ThemeContext.tsx`
- Theme context: Manages theme state, provides toggle function, persists to localStorage.

### `src/app/api/auth/login/route.ts` & `register/route.ts`
- API endpoints: Handle login and registration, return JWT token.

### `src/app/api/user/profile/route.ts`
- API endpoint: Returns user profile for authenticated requests.

### `src/components/ui/Button.tsx` & `Input.tsx`
- Reusable UI: Theme-aware, accessible, and styled with Tailwind.

---

##  Tech Stack

- Next.js 15 (App Router, API routes)
- TypeScript (type safety)
- Tailwind CSS(utility-first styling)
- React Context API (theme management)
- Web Speech API (voice input)
- LocalStorage (analytics, theme persistence)
- Custom Hooks & Utilities

---

##  Setup & Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/zerocode-chatbot.git
   cd zerocode-chatbot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage Guide

### Authentication
- Register a new account or login with existing credentials.
- JWT token is stored in localStorage for session persistence.

### Chatbot
- Type your message and press Enter or click Send
- Use the microphone icon for voice input (speech-to-text).
- Auto-scroll keeps the latest message in view.
- Input history: Use `Ctrl+↑/↓` to cycle through previous messages.

### Theme Toggle
- Click the sun/moon icon in the header to switch between light and dark mode.
- Theme preference is saved and persists across sessions.

### Analytics Dashboard
- Click the Analytics button in the header.
- View real-time stats: total messages, user/bot split, response time, activity charts, popular topics, and more.
- Reset Analytics to clear all tracked data.

---

## Analytics Dashboard

- Overview Cards: Total messages, user/bot split, average response time.
- hourly/Weekly Activity: Bar charts showing when you chat most.
- Popular Topics: What you talk about most, with progress bars.
- Performance Metrics: Response accuracy, satisfaction, uptime.
- Reset Button: Clear all analytics data.

---

##  Code Walkthrough

### Main Chat Page (`src/app/page.tsx`)
- Handles authentication state, chat logic, input history, auto-scroll, and voice input.
- Integrates with analytics tracker for real-time stats.

### Analytics Tracker (`src/lib/analytics.ts`)
- Tracks every message, calculates stats, and persists data in localStorage.
- Provides methods for adding messages, calculating response time, and topic analysis.

### Analytics Dashboard (`src/app/analytics/page.tsx`)
- Fetches analytics from tracker and displays with beautiful charts and cards.
- Allows resetting analytics data.

### Theme Context (`src/contexts/ThemeContext.tsx`)
- Manages light/dark mode and persists user preference.

### Voice Input
- Uses Web Speech API for speech-to-text.
- Handles browser compatibility and error states.

### UI Components
- Button, Input: Reusable, theme-aware components.
- ThemeToggle: Sun/moon icon for theme switching.
- PromptTemplates: Quick prompt suggestions for chat.

---

##  Customization

- Add new prompt templates in `src/components/PromptTemplates.tsx`.
- Change analytics logic in `src/lib/analytics.ts`.
- Style overrides in `src/app/globals.css` (uses Tailwind).
- Add new API routes in `src/app/api/`.

---

##  Contributing

1. Fork this repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a new Pull Request

---

##  License

[MIT](LICENSE)

---

## credits

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OpenAI](https://openai.com/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---
