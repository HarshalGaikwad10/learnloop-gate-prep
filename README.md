# LearnLoop AI — Unified Civil Engineering Learning Platform

> **Engineering Minds. Structuring Futures.**

An institution-independent Civil Engineering learning platform combining structured engineering lessons, practical applications, multilingual AI tutoring, conceptual understanding checks, and relevant competitive-examination preparation.

LearnLoop AI is designed to support Civil Engineering students from colleges and universities across India. It integrates foundational university curriculum with contextual competitive examination preparation (GATE Civil Engineering — CE and GATE Environmental Science & Engineering — ES) into one coherent, unified learning journey.

*(Note: The initial 6-module course focuses on Water Supply, Sanitation, and Environmental Engineering; it provides structured, outcome-based engineering education and contextual examination highlights rather than claiming to cover every single university syllabus or the entire GATE examination syllabus).*

🌐 **Live Demo:** [LearnLoop AI](https://learnloop-gate-prep.vercel.app/)

---

## 🚀 Key Features

- **Core Civil Engineering Curriculum:** Structured 6-module curriculum covering municipal water demand, water treatment units, pipe distribution hydraulics, sewage characterization, biological secondary treatment (ASP), and tertiary/sludge management.
- **Contextual GATE CE Highlights (`🎯 Important for GATE CE`):** Selective, syllabus-verified annotations highlighting key formulas, design criteria, numerical traps, and conceptual distinctions according to the official GATE CE Section 6 (Environmental Engineering) syllabus.
- **Preserved GATE ES Coverage:** Preserves environmental chemistry, microbial kinetics, reactor hydraulics, and water resources topics for dual-paper aspirants.
- **Unified Learning Experience:** No segregated tracks or fragmented tabs — students learn engineering naturally with exam highlights embedded right where they matter.
- **Multilingual AI Teacher:** Conceptual explanations with local engineering analogies in English, Hindi, Marathi, and Manipuri with technical terms and standard formulas preserved.
- **Conceptual Understanding Checks:** Signature open-ended conceptual assessments evaluated by AI against rubric criteria with feedback on misconceptions and missing points.
- **Mathematical & Chemical Equation Rendering:** Native KaTeX rendering with responsive KaTeX-free CSS fallbacks for fractions, radicals, Greek letters, and chemical notation.
- **Topic-Wise Practice & Curated Question Bank:** 287 GATE-level questions with step-by-step solutions and progressive hints.
- **Verifiable Credentials:** Outcome-based certificate qualification and tamper-proof verification.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React.js** | Frontend application |
| **JavaScript** | Application logic |
| **Recharts** | Data visualization |
| **Google Gemini API** | AI tutoring and revision assistance |
| **Vercel** | Hosting and serverless API deployment |
| **Google Fonts** | Typography using Outfit and DM Sans |

---

## 📚 Subject Coverage

The curated question bank includes topics from **Concrete Technology**, including:
- Water-Cement Ratio
- Workability
- Hydration of Cement
- Compressive Strength
- Admixtures
- Durability of Concrete

The platform is designed to support the expansion of subjects and topics relevant to GATE Civil Engineering.

---

## 🧠 AI Chatbot

LearnLoop AI includes a conversational learning assistant powered by the Google Gemini API.

The chatbot is designed to help students:
- Understand civil engineering concepts in simple language.
- Work through numerical problems step by step.
- Understand MCQ answers and hints.
- Ask follow-up questions during a learning session.
- Clarify doubts while preparing for examinations.

The chatbot uses a server-side API endpoint (`/api/chat`) so that the Gemini API key remains outside the frontend code.

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- `npm`
- A Google Gemini API key
- [Vercel CLI](https://vercel.com/docs/cli) for local serverless API testing

### 1. Clone the repository
```bash
git clone https://github.com/HarshalGaikwad10/learnloop-gate-prep.git
cd learnloop-gate-prep
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the project root and add your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key
```

> [!IMPORTANT]
> **Security:** Never commit your `.env` file or expose your API key in frontend code. Ensure `.env` is included in `.gitignore`.

### 4. Run the application

For frontend development without serverless API routes:
```bash
npm start
```

To test the application with its Vercel serverless API endpoint, use:
```bash
npx vercel dev
```
Follow the Vercel CLI prompts if required.

---

## 📁 Project Structure

The project follows a React application structure with a serverless API endpoint:

```
learnloop-gate-prep/
├── api/
│   └── chat.js
├── public/
├── src/
│   ├── components/
│   │   └── Chatbot.jsx
│   ├── services/
│   │   └── chatService.js
│   ├── styles/
│   │   └── chatbot.css
│   ├── App.js
│   ├── App.test.js
│   ├── index.js
│   └── ...
├── .gitignore
├── package.json
└── README.md
```

---

## 🌐 Deployment

LearnLoop AI is hosted on [Vercel](https://vercel.com/).

To deploy:
1. Push the latest code to the connected GitHub repository.
2. Import or connect the repository to Vercel.
3. Configure `GEMINI_API_KEY` in the Vercel project environment variables (**Settings → Environment Variables**).
4. Deploy the application and verify the chatbot API endpoint.

> [!NOTE]
> Environment variables configured on your local machine are not automatically transferred to Vercel.

---

## 🎯 Project Objective

The objective of LearnLoop AI is to make GATE Civil Engineering preparation more organized, interactive, and accessible by combining structured practice with AI-assisted learning.

The project aims to encourage concept-based understanding, consistent revision, and performance-aware preparation rather than relying solely on memorization.

---

## 🔮 Future Scope

Potential future improvements include:
- Expanded question banks across all GATE Civil Engineering subjects.
- Personalized study schedules and revision reminders.
- Long-term progress tracking and data persistence.
- Topic-wise analytics and performance insights.
- Previous-year question analysis.
- More advanced AI tutoring and personalized learning recommendations.

---

## 👨‍💻 Developer

LearnLoop AI is developed under **StructaMind**, with a focus on applying AI and modern web technologies to engineering education.

---

## 📄 License

No license has been specified yet. Unless a license is added to this repository, reuse and redistribution remain subject to the applicable copyright rules.
