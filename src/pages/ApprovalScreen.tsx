import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function ApprovalScreen() {
  const { transactionId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!transactionId) return;

    const fetchTransaction = async () => {
      const docRef = doc(db, 'transactions', transactionId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setTransaction({ id: docSnap.id, ...docSnap.data() } as Transaction);
      } else {
        toast.error('Transaction not found');
        navigate(-1);
      }
    };

    fetchTransaction();
  }, [transactionId, navigate]);

  const handleApprove = async () => {
    if (!transaction || !currentUser) return;
    
    setLoading(true);
    try {
      // Update transaction status
      await updateDoc(doc(db, 'transactions', transaction.id), {
        status: 'approved'
      });

      // Deduct from elder balance
      await updateDoc(doc(db, 'users', transaction.elderId), {
        balance: increment(-transaction.amount)
      });

      toast.success('Transaction approved!');
      navigate(-1);
    } catch (error) {
      console.error('Error approving transaction:', error);
      toast.error('Failed to approve transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!transaction) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'transactions', transaction.id), {
        status: 'rejected'
      });

      toast.success('Transaction rejected');
      navigate(-1);
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      toast.error('Failed to reject transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <p className="text-2xl text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const isHighRisk = transaction.amount > 2000;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 h-14 text-lg"
        >
          <ArrowLeft className="h-6 w-6 mr-2" />
          Back
        </Button>

        <Card className="p-8 shadow-strong">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-warning-light rounded-full mb-6">
              <AlertTriangle className="h-12 w-12 text-warning" />
            </div>
            <h1 className="text-4xl font-bold mb-3">Elder Decision Screen</h1>
            <p className="text-xl text-muted-foreground">
              {transaction.status === 'pending_approval' 
                ? 'This transaction requires approval'
                : `This transaction has been ${transaction.status.replace('_', ' ')}`
              }
            </p>
          </div>

          {isHighRisk && (
            <div className="bg-destructive-light border-2 border-destructive rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-8 w-8 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-2xl text-destructive mb-2">⚠️ High-Risk Transaction</p>
                  <p className="text-lg text-destructive/90">
                    This transaction exceeds ₹2000. Please review very carefully before approving.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6 mb-10">
            <div className="flex justify-between items-center p-6 bg-muted rounded-lg">
              <span className="text-xl text-muted-foreground">Vendor</span>
              <span className="font-bold text-2xl">{transaction.vendor}</span>
            </div>
            <div className="flex justify-between items-center p-6 bg-muted rounded-lg border-2 border-destructive">
              <span className="text-xl text-muted-foreground">Amount</span>
              <span className="font-bold text-4xl text-destructive">₹{transaction.amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center p-6 bg-muted rounded-lg">
              <span className="text-xl text-muted-foreground">Date</span>
              <span className="font-semibold text-xl">
                {new Date(transaction.timestamp).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {transaction.status === 'pending_approval' && (
            <div className="grid grid-cols-2 gap-6">
              <Button
                variant="outline"
                size="lg"
                onClick={handleReject}
                disabled={loading}
                className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground h-16 text-xl"
              >
                <XCircle className="h-7 w-7 mr-2" />
                ರದ್ದುಗೊಳಿಸಿ (Reject)
              </Button>
              <Button
                size="lg"
                onClick={handleApprove}
                disabled={loading}
                className="bg-gradient-success hover:opacity-90 h-16 text-xl"
              >
                <CheckCircle2 className="h-7 w-7 mr-2" />
                ಮಂಜೂರು (Approve)
              </Button>
            </div>
          )}

          {transaction.status !== 'pending_approval' && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(-1)}
              className="w-full h-16 text-xl"
            >
              Close
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
