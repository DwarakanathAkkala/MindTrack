# Better You: Your Personal Wellness Companion

![Better You Landing Page](./src/assets/landing-page.webp)

## Introduction
Better You is a dynamic, client-side web application designed to help you build lasting habits, balance your mind, and achieve your personal wellness goals. It provides users with a comprehensive, single-page platform to organize their self-improvement journey. From creating highly detailed, customizable habits and visualizing progress on a streak calendar to receiving motivational boosts and analyzing personal insights, Better You aims to make wellness planning structured, enjoyable, and elegant. This project leverages the power of Firebase for its backend services, including authentication and a real-time database, to create a seamless and responsive user experience.

## Project Type
Frontend | Serverless Backend (Firebase)

## Deployed App
**Live Site:** [https://better-you-zeta.vercel.app/]

**Database:** The project uses Google's Firebase Realtime Database, which can be viewed in the [Firebase Console](https://console.firebase.google.com/) (requires project access).

## Directory Structure
mindtrack/
├── public/
│ └── hero-illustration.svg
│ └── logo.png
│
├── src/
│ ├── assets/
│ │ └── logo.png
│ ├── components/
│ │ ├── layout/
│ │ │ └── MainLayout.tsx
│ │ └── ui/
│ │ ├── ConfirmationDialog.tsx
│ │ ├── ConfirmationDialog.module.css
│ │ ├── MotivationalMessage.tsx
│ │ ├── MotivationalMessage.module.css
│ │ ├── ReminderManager.tsx
│ │ ├── ReminderManager.module.css
│ │ └── useConfirmationDialog.ts
│ ├── features/
│ │ ├── auth/
│ │ │ ├── components/
│ │ │ │ └── AuthListener.tsx
│ │ │ ├── authSlice.ts
│ │ │ └── services.ts
│ │ ├── habits/
│ │ │ ├── components/
│ │ │ │ ├── AddHabitModal.tsx
│ │ │ │ └── AddHabitModal.module.css
│ │ │ ├── habitsSlice.ts
│ │ │ ├── logsSlice.ts
│ │ │ └── services.ts
│ │ ├── user/
│ │ │ ├── userSlice.ts
│ │ │ └── services.ts
│ │ └── ... (onboarding, etc.)
│ ├── hooks/
│ │ └── useReminder.ts
│ ├── lib/
│ │ └── firebase.ts
│ ├── pages/
│ │ ├── DashboardPage.tsx
│ │ ├── InsightsPage.tsx
│ │ ├── InsightsPage.module.css
│ │ ├── LandingPage.tsx
│ │ └── OnboardingPage.tsx
│ ├── router/
│ │ └── AppRouter.tsx
│ ├── index.css
│ └── ... (main.tsx, App.tsx, etc.)
│
├── .env.local (For Firebase API Keys)
├── vercel.json (For Vercel deployment routing)
└── package.json
code
Code
## Features
- **Secure & Seamless Authentication:** Users can sign up or log in instantly and securely using their Google account.
- **Personalized Onboarding:** A one-time, multi-step onboarding flow collects the user's name and focus areas (Fitness, Sleep, etc.) to tailor the experience from the start.
- **Rich Habit Creation & Management:** A central dashboard where users can perform full CRUD operations (Create, Read, Update, Delete) on their habits. The habit creation modal allows for deep customization:
    -   **Categorization:** Assign a custom category (e.g., "Health," "Work").
    -   **Visuals:** Choose a unique color and icon for each habit.
    -   **Goals:** Set specific targets based on **Reps**, **Duration**, or **Steps**.
    -   **Scheduling:** Define a **Start Date** and an optional **End Date**.
    -   **Reminders:** Set an optional **Reminder Time** to receive browser notifications.
    -   **Subtasks:** Break down complex habits into smaller, manageable steps.
- **Dynamic Dashboard:** The main view provides an at-a-glance list of "Today's Habits," which can be marked complete with a single click, providing immediate visual feedback.
- **Visual Streak Calendar:** A powerful calendar that visualizes user consistency:
    -   **Daily Status:** Days are automatically colored: a **yellow ring** for partial completion and a **solid green circle** for completing all habits.
    -   **Streak Visualization:** Consecutive completed days are visually linked with a continuous bar to form a "streak snake."
    -   **Streak Counter:** The current day-streak is prominently displayed with a 🔥 emoji for motivation.
- **Progress Insights Page:** A dedicated page that provides clear, data-driven reports and summaries of a user's progress, including overall completion percentages and a breakdown of performance by category.
- **Motivational Boosts:** The dashboard includes a daily motivational quote to keep users inspired.
- **Browser Notifications:** An opt-in reminder system that uses the browser's native Notification API to alert users when it's time to complete a habit.
- **Elegant & Responsive Design:** The entire application is built with a mobile-first approach and features a clean, modern UI with smooth animations and a consistent layout.

## Design Decisions or Assumptions
- **Serverless Architecture:** I chose Firebase for all backend services (Auth, Realtime Database) to create a powerful, real-time application without needing to manage a server. This simplifies deployment and scaling.
- **Component-Scoped & Global CSS:** The project uses a hybrid styling approach. Global, reusable utility classes (like `.btn-primary`) are defined in `index.css` using Tailwind's `@apply`. Complex, component-specific styles (like for modals) are encapsulated in CSS Modules (`*.module.css`) to improve organization and prevent style collisions.
- **State Management:** Redux Toolkit is used as a single source of truth for all application state (user session, habits, logs), ensuring a predictable and reactive UI.
- **Custom Hooks:** Logic for complex, reusable UI patterns (like the confirmation dialog) is abstracted into custom hooks (`useConfirmationDialog`) to keep component code clean and declarative.
- **Client-Side SPA Routing:** The application uses React Router to handle all navigation on the client side. A rewrite rule in `vercel.json` ensures that direct navigation to any route works correctly in a deployed environment.

## Usage
1.  Navigate to the deployed app URL or your local server.
2.  Click "Get Started Free" to sign in with your Google account.
3.  If you are a new user, you will be guided through a personalized onboarding flow.
4.  On the dashboard, you can:
    - Click "New Habit" to create and customize habits.
    - Click the checkbox on a habit to mark it as complete for the day.
    - Use the "three dots" menu to edit or delete existing habits.
    - Click on the "Insights" navigation link to view your progress stats.

## Technology Stack
-   **Framework:** React 18+ with TypeScript
-   **Build Tool:** Vite
-   **Styling:** Tailwind CSS, CSS Modules
-   **State Management:** Redux Toolkit
-   **Backend:**
    -   Firebase Authentication
    -   Firebase Realtime Database
-   **Routing:** React Router
-   **Deployment:** Vercel