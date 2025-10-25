# 🏦 FinSync - Safe Digital Payments for Senior Citizens

A React-based FinTech application designed to help senior citizens learn and use digital payments safely, with a family guardian protection layer.

## 🎯 Purpose

FinSync helps elderly users navigate digital payments with confidence by providing:
- **Large, readable UI** with senior-friendly design (18-22px fonts, high contrast)
- **Protection Layer**: Transactions over ₹1000 require family guardian approval
- **Kannada language support** for better accessibility
- **Family connection** for guidance and fraud prevention

## 👥 User Roles

### 1️⃣ Elder (Primary User)
- Senior citizen learning digital payments
- Can initiate transactions with approval flow
- Large buttons and clear visual feedback
- Tooltips for first-time guidance

### 2️⃣ Family Guardian
- Grandchild, child, or caregiver
- Monitors pending transactions
- Approves or rejects high-risk payments
- Protects elder from fraud and scams

## 🔒 Protection Rules

- **Amount ≤ ₹1000**: Auto-approved ✅
- **Amount > ₹1000**: Requires guardian approval 🔸
- **Amount > ₹2000**: High-risk warning displayed ⚠️

## ✨ Key Features

### Elder Dashboard
- ✅ Large typography (18-22px base)
- ✅ Clear balance display
- ✅ Color-coded transactions:
  - Green = Approved
  - Orange = Pending
  - Red = Rejected
- ✅ AI Help button: "ಸಹಾಯ ಬೇಕೆ?" (Need Help?)
- ✅ Tooltips and guidance

### Elder Decision Screen
- ✅ Bold vendor name
- ✅ Red warning for amount
- ✅ Large action buttons with Kannada text
- ✅ High-risk alerts for amounts > ₹2000

### Family Guardian Dashboard
- ✅ Pending approvals counter
- ✅ One-tap approve/reject
- ✅ Real-time transaction monitoring

## 🎨 Accessibility Features

- **High Contrast**: Enhanced color ratios for better visibility
- **Large Touch Targets**: Minimum 48×48px for all interactive elements
- **Senior-Friendly Fonts**: 18-22px base font size
- **Kannada Language**: Key UI elements in Kannada
- **Tooltips**: Contextual help for first-time users
- **Simple Navigation**: Clear, intuitive flow

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Auth & Database**: Firebase Authentication + Firestore
- **UI Components**: shadcn/ui (customized for seniors)
- **Routing**: React Router v6

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd finsync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Follow instructions in `FIREBASE_SETUP.md`
   - Create `.env` file with Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

4. **Run the app**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:8080`

## 📱 Testing the App

1. **Create Guardian Account**:
   - Sign up with role "Family Guardian"
   - Copy the User ID from dashboard

2. **Create Elder Account**:
   - Sign up with role "Elder"
   - Paste Guardian's User ID to link accounts

3. **Test Transaction Flow**:
   - Use browser console to add mock transactions:
   ```javascript
   import { addMockTransaction } from '@/utils/mockData';
   addMockTransaction('ELDER_UID', 'GUARDIAN_UID');
   ```

## 🎨 Design System

The app uses a comprehensive design system optimized for senior citizens:

### Colors (HSL)
- **Primary**: Blue (220° 70% 50%) - Trust and security
- **Success**: Green (142° 71% 45%) - Approved transactions
- **Warning**: Orange (38° 92% 50%) - Pending approval
- **Destructive**: Red (0° 84% 60%) - Rejected/high-risk

### Typography
- **Base**: 18px (senior-friendly)
- **Headings**: 2xl-4xl (32-48px)
- **Body**: lg-xl (18-20px)

### Spacing
- **Touch Targets**: Minimum 48×48px
- **Padding**: Generous (24-32px for cards)
- **Icons**: Large (24-32px base)

## 🌏 Kannada Language Support

Key UI elements include Kannada translations:
- ಸ್ವಾಗತ! (Welcome)
- ನಿಮ್ಮ ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು (Your Recent Transactions)
- ಮಂಜೂರು (Approve)
- ರದ್ದುಗೊಳಿಸಿ (Reject)
- ಸಹಾಯ ಬೇಕೆ? (Need Help?)
- ಪ್ರಾರಂಭಿಸಿ (Get Started)

## 📂 Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── ProtectedRoute.tsx
│   └── TransactionCard.tsx
├── contexts/
│   └── AuthContext.tsx  # Firebase auth context
├── lib/
│   ├── firebase.ts      # Firebase config
│   └── utils.ts         # Utility functions
├── pages/
│   ├── Index.tsx        # Landing page
│   ├── Auth.tsx         # Login/Signup
│   ├── ElderDashboard.tsx
│   ├── GuardianDashboard.tsx
│   └── ApprovalScreen.tsx
├── types/
│   └── index.ts         # TypeScript types
└── utils/
    └── mockData.ts      # Mock transaction generator
```

## 🔐 Security

- Firebase Authentication for secure user management
- Row-Level Security via Firestore rules
- Guardian ID linking prevents unauthorized access
- Role-based route protection

## 🚀 Deployment

### Via Lovable
Simply open [Lovable](https://lovable.dev/projects/0ed35939-4041-42d4-9f3c-69e2bc438db6) and click on Share → Publish.

### Firebase Hosting
```bash
npm run build
firebase deploy
```

See `FIREBASE_SETUP.md` for detailed deployment instructions.

## 🎯 Future Enhancements

- [ ] Voice guidance (text-to-speech)
- [ ] AI chatbot for financial safety tips
- [ ] Fraud pattern detection
- [ ] Transaction history analytics
- [ ] Multi-language support (Hindi, Telugu, Tamil)
- [ ] SMS notifications for guardians
- [ ] Biometric authentication

## 📄 License

MIT License

## 🤝 Contributing

Contributions welcome! Please focus on maintaining senior-friendly design principles.

---

**Built with ❤️ for senior citizens learning digital payments**

**Lovable Project**: https://lovable.dev/projects/0ed35939-4041-42d4-9f3c-69e2bc438db6
