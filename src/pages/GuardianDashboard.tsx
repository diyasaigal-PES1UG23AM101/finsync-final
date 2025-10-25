import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Transaction } from '@/types';
import { TransactionCard } from '@/components/TransactionCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, Shield, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function GuardianDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingTransactions, setTransactions] = useState<Transaction[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'transactions'),
      where('guardianId', '==', currentUser.uid),
      where('status', '==', 'pending_approval'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txns: Transaction[] = [];
      snapshot.forEach((doc) => {
        txns.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      setTransactions(txns);
    });

    return unsubscribe;
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const copyUserId = () => {
    if (currentUser) {
      navigator.clipboard.writeText(currentUser.uid);
      setCopied(true);
      toast.success('User ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="bg-gradient-primary shadow-strong">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-foreground/20 rounded-xl">
                <Shield className="h-10 w-10 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-primary-foreground">
                  Family Guardian
                </h1>
                <p className="text-primary-foreground/90 text-xl">{currentUser?.fullName}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout} 
              className="text-primary-foreground hover:bg-primary-foreground/20 h-14 w-14"
            >
              <LogOut className="h-7 w-7" />
            </Button>
          </div>

          {/* User ID Card */}
          <Card className="bg-card/95 backdrop-blur-sm shadow-medium">
            <div className="p-6">
              <p className="text-xl text-muted-foreground mb-3">Your Guardian ID</p>
              <div className="flex items-center gap-3">
                <code className="text-base bg-muted px-4 py-3 rounded flex-1 truncate">
                  {currentUser?.uid}
                </code>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={copyUserId}
                  className="h-14"
                >
                  {copied ? <Check className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
                </Button>
              </div>
              <p className="text-base text-muted-foreground mt-3">
                Share this ID with your elder to link accounts
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-foreground">
            Pending Approvals
          </h2>
          <Card className="px-6 py-3">
            <p className="text-3xl font-bold text-warning">{pendingTransactions.length}</p>
          </Card>
        </div>

        {pendingTransactions.length === 0 ? (
          <Card className="p-12 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-2xl text-muted-foreground mb-2">No pending transactions</p>
            <p className="text-lg text-muted-foreground">
              You'll see transactions that need approval here
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onClick={() => navigate(`/approve/${transaction.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
