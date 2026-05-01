# 🥗 AI-Powered Calorie Tracker (MyFitnessPal Clone)

> A full‑stack fitness web application that logs meals using natural language, tracks calories with AI, and shows beautiful analytics. Built with React, Node.js, MongoDB, and Gemini AI.

![Preview](https://via.placeholder.com/800x400?text=Calorie+Tracker+Screenshot)  
*(Replace with a real screenshot of your dashboard)*

---

## ✨ Features

### 🔐 Authentication
- User registration & login (JWT‑based)
- Secure token storage & protected routes
- Fully isolated user data (each user sees only their own meals)

### 🍽️ Smart Food Logging
- Natural language input: `2 roti + rice + milk`
- AI parsing using **Google Gemini** (with local fallback)
- Supports quantities, units (`cup`, `bowl`, `half`), and complex sentences

### 📊 Dashboard
- Animated circular calorie progress ring
- Remaining calories display
- Quick‑add meal buttons (breakfast/lunch/dinner)
- Recent activity feed

### 📖 Food Diary
- Log meals per meal type (breakfast, lunch, dinner)
- Date picker to view/edit past days
- Auto‑save to MongoDB, real‑time updates
- Delete individual food entries

### 📈 Analytics
- Weekly calorie trend chart (Recharts)
- Smooth area chart with tooltips
- Dynamic data fetching from backend

### 👤 Profile
- User information and avatar (initial letter)
- Editable daily calorie goal (500–10,000 cal)
- Streak tracking (consecutive days with logs)
- Join date and app version info

### 🎨 Premium UI/UX
- Modern glassmorphic cards (`backdrop-blur`)
- Smooth frame‑motion animations (page transitions, hover effects)
- Confetti celebration when daily goal is achieved
- Fully responsive (mobile‑first design)
- Sky‑blue premium colour gradient

### 🤖 AI Nutrition Engine
- **Primary**: Google Gemini API – returns accurate estimates for any meal description
- **Fallback**: Local intelligent food database (Indian & Western foods, quantity parsing)
- No AI API key? The local parser works offline

---

## 🧠 Tech Stack

| Layer       | Technologies                                                                 |
|-------------|------------------------------------------------------------------------------|
| **Frontend**| React 18, Vite, Tailwind CSS, Framer Motion, Recharts, React Router, Axios  |
| **Backend** | Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs, Google Gemini AI SDK   |
| **DevOps**  | Concurrently (for running both servers), dotenv, CORS                        |

---

## 📁 Project Structure
