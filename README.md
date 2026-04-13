# 🧠 Psycin – AI Reflection Space

A safe, private AI-powered reflection chat application that helps users express thoughts and receive supportive AI responses in real time.

## 🚀 Live Demo
Frontend: https://psychin.vercel.app  
Backend: https://psychin-backend.onrender.com  

## 📌 Features
- AI-powered chat interface  
- JWT authentication (Login / Signup)  
- Emotion-aware responses  
- Full-stack MERN application  
- 3D neural UI experience  
- Protected backend routes  
- Deployed on Vercel + Render  

## 🏗️ Tech Stack
Frontend: React.js, Axios, React Router, CSS  
Backend: Node.js, Express.js, MongoDB, JWT, CORS  
Deployment: Vercel (Frontend), Render (Backend)  

## 📁 Project Structure
psycin/  
├── backend/  
│   ├── config/  
│   ├── middleware/  
│   ├── routes/  
│   ├── server.js  
│   └── .env  
├── frontend/  
│   ├── src/  
│   │   ├── pages/  
│   │   ├── components/  
│   │   ├── services/api.js  
│   │   └── App.js  
└── README.md  

## ⚙️ Setup

Clone repo:
git clone https://github.com/your-username/psychin.git  
cd psychin  

Backend:
cd backend  
npm install  

Create .env:
PORT=5000  
MONGO_URI=your_mongodb_connection  
JWT_SECRET=your_secret  

Run backend:
npm start  

Frontend:
cd frontend  
npm install  
npm start  

## 🔌 API
POST /api/auth/register  
POST /api/auth/login  
POST /api/chat (Bearer Token required)  

## 🔐 Auth Flow
User login → JWT stored in localStorage → token sent in headers → backend verifies middleware  

## 🧠 How It Works
User sends message → backend API processes → AI response generated → frontend updates chat  

## 🌟 Highlights
- Secure authentication  
- Clean API structure  
- Production deployment ready  
- Scalable architecture  

## 🚀 Future Improvements
- Voice input  
- AI memory  
- Sentiment dashboard  
- Dark mode  
- Mobile app  

## 👨‍💻 Developer
Shailendra Pratap Singh  
Full Stack & Web3 Developer  

## 📄 License
MIT License
