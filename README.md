# 🩺 Blood Pressure Monitor App

A comprehensive blood pressure monitoring application built with Next.js, featuring real-time tracking, trend analysis, and professional Excel reporting for medical consultations.

![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.12.0-darkgreen)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-blue)

## ✨ Features

### 📊 **Comprehensive Monitoring**
- **Real-time BP tracking** with systolic, diastolic, and heart rate
- **Automatic categorization** (Normal, Elevated, Stage 1, Stage 2, Crisis)
- **Visual trend analysis** with mathematical calculations
- **Health insights** with personalized recommendations

### 📈 **Advanced Analytics**
- **Interactive charts** with medical color conventions
- **Trend detection** using linear regression analysis
- **Variability assessment** and clinical insights
- **Reading frequency analysis**

### 📋 **Professional Reporting**
- **Excel export** with professional medical formatting
- **Color-coded categories** for easy interpretation
- **Multi-sheet reports** (Summary + Detailed readings)
- **Doctor-ready documentation**

### 🔐 **Secure Authentication**
- **User registration/login** with bcrypt encryption
- **JWT session management** with NextAuth.js
- **Protected routes** and secure API endpoints

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bp-monitor-app.git
   cd bp-monitor-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize database**
   ```bash
   pnpm run db:generate
   pnpm run db:push
   pnpm run db:seed
   ```

5. **Start development server**
   ```bash
   pnpm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Recharts** - Data visualization
- **ExcelJS** - Advanced Excel generation

### **Backend**
- **Next.js API Routes** - Serverless functions
- **Prisma ORM** - Database toolkit
- **NextAuth.js** - Authentication solution
- **bcrypt** - Password hashing
- **JWT** - Token-based auth

### **Database**
- **SQLite** (Development)
- **PostgreSQL** (Production)

## 📱 Usage

### 1. **Create Account**
- Register with email and password
- Secure authentication with encrypted storage

### 2. **Record Readings**
- Enter systolic and diastolic pressure
- Optional heart rate tracking
- Automatic timestamp and categorization

### 3. **Monitor Trends**
- View interactive charts with trend lines
- Get health insights and recommendations
- Track progress over time

### 4. **Export Reports**
- Generate professional Excel reports
- Color-coded medical categories
- Ready for doctor consultations

## 🚀 Deployment

### **Render (Recommended)**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will auto-detect `render.yaml` and deploy!

3. **Access your app**
   Your app will be available at: `https://your-app-name.onrender.com`

### **Manual Deployment**
See detailed instructions in [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🗂️ Project Structure

```
bp-monitor-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── auth-form.tsx     # Authentication forms
│   ├── bp-chart.tsx      # Blood pressure charts
│   └── bp-history.tsx    # Reading history
├── lib/                  # Utility functions
│   ├── auth.ts           # Authentication logic
│   ├── prisma.ts         # Database client
│   ├── excel-export.ts   # Excel generation
│   └── utils.ts          # Common utilities
├── prisma/               # Database schema
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts           # Database seeding
├── public/               # Static assets
├── render.yaml           # Render deployment config
└── package.json          # Dependencies
```

## 🛡️ Security Features

- **Password encryption** with bcrypt
- **JWT token authentication**
- **Environment variable protection**
- **Secure session management**
- **Protected API routes**
- **CORS configuration**

## 🎨 Color Conventions

Following medical standards:
- 🟢 **Green** - Normal (< 120/80)
- 🟡 **Yellow** - Elevated (120-129/<80)
- 🟠 **Orange** - Stage 1 (130-139/80-89)
- 🔴 **Red** - Stage 2 (≥140/≥90)
- 🆘 **Dark Red** - Crisis (>180/>120)

## 📊 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/readings` - Get user's readings
- `POST /api/readings` - Create new reading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:
1. Check the [Issues](https://github.com/yourusername/bp-monitor-app/issues) page
2. Review the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Database management with [Prisma](https://www.prisma.io/)

---

Made with ❤️ for better health monitoring
