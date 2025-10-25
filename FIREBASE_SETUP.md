# 🔥 Firebase Setup Guide for FinSync

**Safe Digital Payments for Senior Citizens**

## Prerequisites
- A Google account
- Node.js installed (v16 or higher)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `finsync-seniors` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method
4. Click "Save"

## Step 3: Create Firestore Database

1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for hackathon/development)
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.time < timestamp.date(2025, 12, 31);
       }
     }
   }
   ```
4. Choose your location (e.g., asia-south1 for India)
5. Click "Enable"

## Step 4: Get Firebase Configuration

1. In Firebase Console, click the **gear icon** (Project Settings)
2. Scroll to "Your apps" section
3. Click the **Web** icon `</>`
4. Register your app with nickname: `FinSync Web`
5. Copy the `firebaseConfig` object

## Step 5: Configure Your App

1. Create a `.env` file in your project root:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase credentials in `.env`:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=finsync-xxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=finsync-xxx
   VITE_FIREBASE_STORAGE_BUCKET=finsync-xxx.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

3. **IMPORTANT**: Never commit `.env` to Git (it's already in `.gitignore`)

## Step 6: Set Up Firestore Collections

The app will automatically create collections when you use it, but here's the structure:

### Users Collection (`users`)
```typescript
{
  uid: string,           // Same as auth UID
  email: string,
  fullName: string,
  role: "elder" | "guardian",
  balance?: number,      // Only for elders
  guardianId?: string    // Only for elders
}
```

### Transactions Collection (`transactions`)
```typescript
{
  id: string,
  elderId: string,
  guardianId: string,
  vendor: string,
  amount: number,
  status: "approved" | "pending_approval" | "rejected",
  timestamp: Date
}
```

## Step 7: Install Dependencies

```bash
npm install
```

## Step 8: Run the App

```bash
npm run dev
```

Visit `http://localhost:8080`

## Testing the App

1. **Sign Up as Guardian**:
   - Create account with role "Family Guardian"
   - Copy your User ID from the dashboard

2. **Sign Up as Elder**:
   - Create account with role "Elder"
   - Paste Guardian's User ID during signup

3. **Test Transaction Flow**:
   - You can manually add transactions to Firestore for testing
   - Or use the mock data utility (see below)

### Adding Mock Transactions

You can add mock transactions for testing by using the browser console:

```javascript
// In browser console
import { addMockTransaction } from '@/utils/mockData';

// Add a mock transaction
addMockTransaction('ELDER_UID', 'GUARDIAN_UID');
```

## Firebase Security Rules (Production)

For production, update Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Transactions
    match /transactions/{transactionId} {
      allow read: if request.auth != null && 
        (resource.data.elderId == request.auth.uid || 
         resource.data.guardianId == request.auth.uid);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.elderId == request.auth.uid || 
         resource.data.guardianId == request.auth.uid);
    }
  }
}
```

## Deployment to Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   - Select "Hosting"
   - Choose your Firebase project
   - Set public directory to: `dist`
   - Configure as single-page app: `Yes`
   - Don't overwrite index.html: `No`

4. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

## Troubleshooting

### Issue: "Firebase: Error (auth/network-request-failed)"
- Check your internet connection
- Verify Firebase API key is correct

### Issue: Transactions not showing up
- Check Firestore rules allow read/write
- Verify user IDs are correctly linked (elder → guardian)

### Issue: Authentication not working
- Ensure Email/Password is enabled in Firebase Console
- Check that environment variables are loaded (restart dev server)

## Support

For issues:
1. Check Firebase Console > Authentication/Firestore for errors
2. Check browser console for error messages
3. Verify all environment variables are set correctly

## Cost Considerations

Firebase Free Tier (Spark Plan) includes:
- ✅ Authentication: 50,000 MAU (Monthly Active Users)
- ✅ Firestore: 1GB storage, 50K reads/day, 20K writes/day
- ✅ Hosting: 10GB storage, 360MB/day transfer

This is more than enough for a senior-friendly digital payment app! 🚀
