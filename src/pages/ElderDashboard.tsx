// src/pages/ElderDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Transaction } from '@/types'; // Assuming Transaction type is defined in '@/types'
import { TransactionCard } from '@/components/TransactionCard'; // Assuming you have this component
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, Bot, Wallet, Copy, Check, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Import Modals
import QRScannerModal from '@/components/QRScannerModal';
import AmountModal from '@/components/AmountModal';

// Import UPI Utils
import {
  extractUpiParts,
  pickMeta,
  setParamInQuery,
  ensureCurrencyINR,
  openGooglePayOnly // The function to trigger the deep link
} from '@/lib/upiUtils';


export default function ElderDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [copied, setCopied] = useState(false);

  // State for QR Flow
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [amountOpen, setAmountOpen] = useState(false);
  const [pendingQuery, setPendingQuery] = useState(''); // Stores the raw query part (pa=...&pn=...)
  const [pendingPayee, setPendingPayee] = useState(''); // Stores payee name for UI

  // Effect to fetch balance and transactions
  useEffect(() => {
    if (!currentUser) return;

    // Listen to user balance
    const unsubscribeUser = onSnapshot(doc(db, 'users', currentUser.uid), (docSnapshot) => { // Renamed doc to docSnapshot to avoid conflict
      if (docSnapshot.exists()) {
        setBalance(docSnapshot.data().balance || 0);
      } else {
        console.warn("User document not found for balance update."); // Use warn
      }
    });

    // Listen to transactions
    const q = query(
      collection(db, 'transactions'),
      where('elderId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribeTransactions = onSnapshot(q, (snapshot) => {
      const txns: Transaction[] = [];
      snapshot.forEach((docSnapshot) => { // Renamed doc to docSnapshot
        // Make sure timestamp is handled correctly if it's a Firestore Timestamp
        const data = docSnapshot.data();
        const timestamp = data.timestamp?.toDate ? data.timestamp.toDate().getTime() : Date.now(); // Convert Timestamp to number or use current time as fallback

        txns.push({
             id: docSnapshot.id,
             ...data,
             timestamp // Ensure timestamp is a number for sorting/display if needed
            } as Transaction);
      });
      setTransactions(txns);
    }, (error) => {
       console.error("Error fetching transactions:", error);
       // Check if it's the specific index error
       if (error.code === 'failed-precondition' && error.message.includes('index')) {
            toast.error("Database Index Required", {
                description: "Firestore needs an index for this query. Check the browser console for a link to create it.",
                duration: 10000 // Show longer
            });
       } else {
           toast.error("Error fetching transactions. Check console.");
       }
    });

    return () => {
      unsubscribeUser();
      unsubscribeTransactions();
    };
  }, [currentUser]);

  // Logout Handler
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth'); // Redirect to login after logout
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  // Copy User ID Handler
  const copyUserId = () => {
    if (currentUser) {
      navigator.clipboard.writeText(currentUser.uid);
      setCopied(true);
      toast.success('User ID copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Transaction Click Handler (for Approval Flow)
  const handleTransactionClick = (transaction: Transaction) => {
    if (transaction.status === 'pending_approval') {
      navigate(`/approve/${transaction.id}`); // Navigate to the approval screen
    }
  };

  // --- M-DIYA-3: Implement Real QR Detected Handler ---
  const handleQRDetected = (scannedData: string) => {
    setShowQRScanner(false); // Close scanner modal

    // Use the utility function to parse the scanned data
    const parts = extractUpiParts(scannedData);

    if (!parts) {
      // If parsing fails, show an error and stop
      toast.error("Invalid QR Code", {
        description: "Scanned data doesn't look like a valid UPI QR code.",
        duration: 5000,
      });
      return;
    }

    // Store the query part and extract payee name
    setPendingQuery(parts.query);
    const meta = pickMeta(parts.query);
    setPendingPayee(meta?.pn || 'Unknown Payee'); // Provide a default if name is missing

    // Open the Amount modal
    setAmountOpen(true);
  };

  // --- M-DIYA-3: Implement Real Amount Confirm Handler ---
  const onAmountConfirm = (amtString: string) => {
    setAmountOpen(false); // Close amount modal

    // Add amount and currency to the original query
    let finalQuery = pendingQuery; // Already stored from handleQRDetected
    finalQuery = setParamInQuery(finalQuery, 'am', amtString); // Add the amount
    finalQuery = ensureCurrencyINR(finalQuery); // Ensure cu=INR

    // Call the utility function to trigger the Google Pay deep link
    try {
        openGooglePayOnly(finalQuery);
    } catch (e) {
        console.error("Error opening Google Pay:", e);
        toast.error("Could not automatically open Google Pay.");
    }

    // Clear the pending state
    setPendingQuery('');
    setPendingPayee('');
  };
  // --- END Implement Real Handlers ---

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-hero pb-24">
        {/* Header Section */}
        <div className="bg-gradient-primary shadow-strong">
          <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-primary-foreground/20 rounded-xl">
                    <Wallet className="h-10 w-10 text-primary-foreground" />
                 </div>
                 <div>
                    <h1 className="text-4xl font-bold text-primary-foreground">ಸ್ವಾಗತ! (Welcome)</h1>
                    <p className="text-primary-foreground/90 text-xl">{currentUser?.fullName}</p>
                 </div>
              </div>
              <Tooltip>
                 <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="text-primary-foreground hover:bg-primary-foreground/20 h-14 w-14">
                       <LogOut className="h-7 w-7" />
                    </Button>
                 </TooltipTrigger>
                 <TooltipContent><p className="text-base">Logout</p></TooltipContent>
              </Tooltip>
            </div>
            {/* Balance Card */}
            <Card className="bg-card/95 backdrop-blur-sm shadow-medium">
               <div className="p-8">
                  <p className="text-xl text-muted-foreground mb-2">Current Balance</p>
                  <p className="text-5xl font-bold text-foreground mb-6">₹{balance.toLocaleString('en-IN')}</p>
                  <div className="flex items-center gap-3 text-base text-muted-foreground">
                     <span className="truncate">User ID: {currentUser?.uid.slice(0, 12)}...</span>
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-10 w-10" onClick={copyUserId}>
                              {copied ? <Check className="h-5 w-5 text-green-500"/> : <Copy className="h-5 w-5" />}
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent><p className="text-base">Copy User ID</p></TooltipContent>
                     </Tooltip>
                  </div>
               </div>
            </Card>
          </div>
        </div>

        {/* Scan QR Button */}
        <div className="max-w-3xl mx-auto px-4 mt-8 mb-8 relative z-10">
           <Button
             size="lg"
             className={
               "w-full h-20 text-xl font-bold bg-green-800 hover:bg-green-900 " +
               "text-white shadow-lg rounded-xl flex items-center justify-center gap-3 " +
               "active:scale-95 transition-transform"
             }
             onClick={() => setShowQRScanner(true)}
           >
              <QrCode className="h-10 w-10" />
              ಕ್ಯೂಆರ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಪಾವತಿಸಿ (Scan QR & Pay)
           </Button>
        </div>

        {/* Transactions Section */}
        <div className="max-w-3xl mx-auto px-4 pt-0 pb-8">
          <h2 className="text-3xl font-bold mb-2 text-foreground">ನಿಮ್ಮ ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು</h2>
          <p className="text-xl text-muted-foreground mb-6">(Your Recent Transactions)</p>
          {transactions.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-2xl text-muted-foreground">No transactions yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                // Assuming TransactionCard is correctly imported and typed
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onClick={() => handleTransactionClick(transaction)}
                />
              ))}
            </div>
          )}
        </div>

        {/* AI Help Button */}
        <div className="fixed bottom-8 right-8 z-20">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                className="rounded-full shadow-strong hover:shadow-glow transition-all h-16 px-8 text-xl"
                onClick={() => toast.info('AI Financial Assistant coming soon!')}
              >
                <Bot className="h-7 w-7 mr-3" />
                ಸಹಾಯ ಬೇಕೆ? (Need Help?)
              </Button>
            </TooltipTrigger>
            <TooltipContent><p className="text-base">Get financial guidance</p></TooltipContent>
          </Tooltip>
        </div>

        {/* Render Modals */}
        <QRScannerModal
           open={showQRScanner}
           onClose={() => setShowQRScanner(false)}
           onDetected={handleQRDetected} // Connected to real handler
        />
        <AmountModal
           open={amountOpen}
           payeeName={pendingPayee}
           onClose={() => setAmountOpen(false)}
           onConfirm={onAmountConfirm} // Connected to real handler
        />

      </div>
    </TooltipProvider>
  );
}