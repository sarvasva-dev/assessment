# 🎓 Enterprise TestPlatform

A modern, highly secure, and feature-rich online examination platform built with Next.js, MongoDB, and Clerk Authentication. Designed for educational institutions and coaching centers to conduct seamless, cheat-proof assessments.

## 🚀 Key Features

### For Administrators 🛡️
- **Secure Authentication**: Enterprise-grade admin login powered by Clerk.
- **Bulk Question Upload**: Easily import hundreds of questions instantly using Excel (`.xlsx` or `.csv`).
- **Comprehensive Dashboard**: Real-time telemetry, live candidate metrics, and system status.
- **Advanced Test Management**: Create tests, set durations, define negative markings, and manage multiple sections.
- **Dynamic Student Forms**: Customize exactly what data to collect from students (Name, Roll No, Section, Phone, etc.).
- **Live Editing**: Edit test questions, delete them, or append new ones manually or via Excel—even after the test is created.
- **One-Click Sharing**: Generate direct join links and share instantly via WhatsApp.
- **Data Export**: Download all student submissions and scorecards as a `.csv` file.

### For Students 👨‍🎓
- **Frictionless Entry**: Direct link access with auto-filling join codes.
- **Branded Interface**: Tests display the institution's custom logo and name.
- **Anti-Cheat System**: 
  - Forced Full-Screen mode.
  - Tab switch detection with stern warnings.
  - Auto-submission on critical security violations.
- **Instant Results**: Beautiful post-test scorecard showing total correct, incorrect, and overall percentage.

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router), React 19
- **Styling**: Custom Vanilla CSS (Glassmorphism & Modern UI)
- **Backend**: Next.js Serverless API Routes
- **Database**: MongoDB (Mongoose)
- **Authentication**: Clerk
- **Utilities**: SheetJS (Excel parsing), Recharts (Analytics)

## 💻 Getting Started (Local Development)

### 1. Clone the repository
```bash
git clone <YOUR_REPO_LINK_HERE>
cd TestPlatform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add the following secure keys:
```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### 4. Run the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the application. The Admin dashboard is located at `/admin/dashboard`.

## 🌐 Deployment (Vercel)
This project is fully optimized for Vercel. 
1. Push this repository to GitHub.
2. Import the repository into your Vercel Dashboard.
3. Add your Environment Variables.
4. Deploy!

> **Important**: Ensure you add `0.0.0.0/0` (Allow Access from Anywhere) to your MongoDB Atlas Network Access to allow Vercel's serverless functions to connect to your database.
