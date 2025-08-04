# Sahayak - Digital Employment & Financial Services Platform

![Sahaayak Logo](https://img.shields.io/badge/Sahayak-Employment%20Platform-blue?style=for-the-badge)

Sahayak is a comprehensive digital platform that connects job seekers with employers while providing integrated financial services including digital wallets, credit scoring, loan suggestions, and investment opportunities. The platform is designed to serve the Indian market with multi-language support and location-based services.

## 🌟 Features

### 👥 User Management
- **Multi-role System**: Job Seekers, Employers, Investors, and Admins
- **Secure Authentication**: JWT-based authentication with role-based access control
- **Profile Management**: Comprehensive user profiles with skills, experience, and financial data
- **Multi-language Support**: 10 Indian languages (English, Hindi, Punjabi, Marathi, Tamil, Telugu, Malayalam, Kannada, Bengali, Gujarati)

### 💼 Employment Services
- **Job Posting & Search**: Location-based job discovery with advanced filtering
- **Skill Assessment**: AI-powered skill evaluation system with automated assessments
- **Application Management**: Complete application lifecycle from posting to hiring
- **Experience Tracking**: Work history and performance ratings
- **Agreement Management**: Digital contracts and agreement signing
- **Recurring Payments**: Automated salary payments for employers

### 💰 Financial Services
- **Digital Wallet**: In-house wallet system for secure transactions
- **Credit Scoring**: Dynamic credit score calculation based on employment history
- **Loan Suggestions**: AI-powered loan recommendations
- **Investment Opportunities**: Fixed deposits and zero-risk investment options
- **Payment Processing**: UPI integration and bank transfer capabilities
- **Financial Analytics**: Spending patterns and savings goal tracking

### 🛠️ Additional Services
- **Tool Sharing**: Equipment rental and sharing marketplace
- **Voice Assistant**: Retell AI integration for voice interactions
- **Geolocation Services**: Map-based job discovery and location tracking
- **Notification System**: Real-time notifications for jobs, payments, and updates
- **Reporting System**: Abuse reporting and admin review system
- **Analytics Dashboard**: Comprehensive metrics and monitoring

## 🏗️ Architecture

### Backend (Node.js/Express)
```
backend_new/
├── config/          # Database and environment configuration
├── controller/      # Business logic controllers
├── middleware/      # Authentication and validation middleware
├── Model/          # MongoDB schemas and models
├── routes/         # API route definitions
├── services/       # Business logic services
├── scripts/        # Utility and testing scripts
└── index.js        # Main application entry point
```

### Frontend (React)
```
frontend_new/
├── public/         # Static assets
├── src/
│   ├── components/ # React components
│   ├── contexts/   # React context providers
│   ├── utils/      # Utility functions
│   ├── i18n/       # Internationalization
│   └── App.jsx     # Main application component
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sahayak2
   ```

2. **Backend Setup**
   ```bash
   cd backend_new
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd frontend_new
   npm install
   ```

4. **Environment Configuration**
   
   Create `.env` file in `backend_new/`:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/sahayak
   
   # Authentication
   JWT_SECRET=your_jwt_secret_key
   
   # External Services
   OPENAI_API_KEY=your_openai_api_key
   RETELL_API_KEY=your_retell_api_key
   
   # Server Configuration
   PORT=5000
   ```

5. **Start the Application**
   
   Backend:
   ```bash
   cd backend_new
   npm run dev
   ```
   
   Frontend:
   ```bash
   cd frontend_new
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api

## 📊 Database Schema

### Core Models
- **User**: User profiles with roles and authentication
- **Job**: Job postings with location and requirements
- **Wallet**: Digital wallet for financial transactions
- **Assessment**: Skill evaluation and testing system
- **UserExperience**: Employment history and ratings
- **CreditScore**: Dynamic credit scoring system
- **LoanSuggestion**: AI-powered loan recommendations

### Key Relationships
```
User (1) ←→ (1) Wallet
User (1) ←→ (N) Job (as employer)
User (1) ←→ (N) UserApplication (as seeker)
User (1) ←→ (N) UserExperience
Job (1) ←→ (N) Assessment
User (1) ←→ (1) CreditScore
```

## 🔧 API Endpoints

### Authentication
- `POST /api/users/signup` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile

### Jobs
- `GET /api/jobs` - List jobs with filters
- `POST /api/jobs` - Create new job (employers)
- `POST /api/applications` - Apply for job
- `GET /api/applications/seeker/:id` - Get user applications

### Wallet & Payments
- `GET /api/wallet` - Get wallet information
- `POST /api/wallet/add-money` - Add money to wallet
- `GET /api/wallet/transactions` - Transaction history
- `POST /api/recurring-payments` - Setup recurring payments

### Assessments
- `POST /api/assessments/create-skill-assessment` - Create assessment
- `POST /api/assessments/:id/start` - Start assessment
- `POST /api/assessments/:id/answer` - Submit answer
- `GET /api/assessments/user/:id` - Get user assessments

### Credit & Loans
- `GET /api/credit-scores` - Get credit score
- `GET /api/loan-suggestions` - Get loan recommendations
- `POST /api/loan-suggestions` - Apply for loan

## 🧪 Testing

### Backend Testing
```bash
cd backend_new

# Test all systems
npm run test-all

# Test specific components
npm run test-wallet
npm run test-auth-fix
npm run test-mock-payments
npm run test-assessments
```

### Available Test Scripts
- `test-wallet`: Test wallet functionality
- `test-auth-fix`: Test authentication system
- `test-mock-payments`: Test payment processing
- `test-assessments`: Test skill assessment system
- `diagnose`: General system diagnostics

## 🌐 Multi-language Support

Sahayak supports 10 Indian languages:
- English (en)
- Hindi (hi)
- Punjabi (pa)
- Marathi (mr)
- Tamil (ta)
- Telugu (te)
- Malayalam (ml)
- Kannada (kn)
- Bengali (bn)
- Gujarati (gu)

Language switching is available in the user interface with automatic detection based on browser preferences.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for different user types
- **Input Validation**: Comprehensive input sanitization
- **Password Hashing**: bcrypt for secure password storage
- **API Rate Limiting**: Protection against abuse
- **CORS Configuration**: Secure cross-origin requests

## 📱 Mobile Responsiveness

The platform is fully responsive and optimized for:
- Desktop browsers
- Tablet devices
- Mobile phones
- Progressive Web App (PWA) capabilities

## 🔌 External Integrations

### AI Services
- **OpenAI**: For skill assessment generation and evaluation
- **Retell AI**: Voice assistant integration

### Payment Services
- **Razorpay**: Payment gateway integration
- **UPI**: Direct UPI payment support
- **Bank Transfers**: NEFT/RTGS integration

### Location Services
- **Mapbox**: Interactive maps and location services
- **Leaflet**: Map visualization
- **Geocoding**: Address to coordinates conversion

## 📈 Monitoring & Analytics

- **Prometheus Metrics**: System performance monitoring
- **Fluentd Logging**: Centralized log management
- **Credit Score Analytics**: Financial behavior tracking
- **Job Market Analytics**: Employment trends and insights

## 🚀 Deployment

### Production Deployment
1. **Environment Setup**
   ```bash
   # Set production environment variables
   NODE_ENV=production
   MONGODB_URI=mongodb://production-server/sahayak
   ```

2. **Build Frontend**
   ```bash
   cd frontend_new
   npm run build
   ```

3. **Start Production Server**
   ```bash
   cd backend_new
   npm start
   ```

### Docker Deployment
```dockerfile
# Dockerfile example for backend
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD [\"npm\", \"start\"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Use conventional commit messages

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend Development**: Node.js, Express, MongoDB
- **Frontend Development**: React, JavaScript, CSS
- **AI Integration**: OpenAI, Retell AI
- **Financial Services**: Payment gateways, Credit scoring
- **DevOps**: Docker, Monitoring, Deployment

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

## 🗺️ Roadmap

### Upcoming Features
- [ ] Mobile app development (React Native)
- [ ] Advanced AI job matching
- [ ] Blockchain integration for secure contracts
- [ ] Enhanced financial products
- [ ] International expansion
- [ ] Advanced analytics dashboard

### Recent Updates
- ✅ In-house wallet system implementation
- ✅ Multi-language support
- ✅ Voice assistant integration
- ✅ Credit scoring system
- ✅ Automated payment processing

---

**Sahayak** - Empowering employment and financial inclusion through technology 🚀

*Built with ❤️ for the Indian workforce*