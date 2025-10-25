// src/components/AmountModal.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // If needed, though not used in current structure
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner'; // Using sonner for errors

interface AmountModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: string) => void; // Expects amount as string 'x.xx'
  payeeName?: string; // Optional payee name from QR
}

const AmountModal: React.FC<AmountModalProps> = ({ open, onClose, onConfirm, payeeName }) => {
  const [amount, setAmount] = useState('');

  // Reset amount when the modal opens
  useEffect(() => {
    if (open) {
      setAmount('');
    }
  }, [open]);

  // Handle amount input changes, allowing only numbers and one decimal
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove non-digit/non-decimal characters, allow only one decimal point
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    const decimalParts = sanitizedValue.split('.');

    // Ensure only one decimal point and max 2 decimal places
    if (decimalParts.length <= 2) {
      if (decimalParts[1] && decimalParts[1].length > 2) {
        // Truncate extra decimal places
        setAmount(`${decimalParts[0]}.${decimalParts[1].substring(0, 2)}`);
      } else {
        setAmount(sanitizedValue);
      }
    }
  };

  // Validate and confirm the amount
  const handleConfirm = () => {
    const trimmedAmount = amount.trim();
    if (!trimmedAmount) {
      toast.error('Please enter an amount');
      return;
    }
    const numAmount = parseFloat(trimmedAmount);
    if (isNaN(numAmount) || !isFinite(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }
    // Format to exactly two decimal places (required by some UPI apps)
    onConfirm(numAmount.toFixed(2));
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">ಮೊತ್ತವನ್ನು ನಮೂದಿಸಿ (Enter Amount)</DialogTitle>
          {payeeName && (
            <DialogDescription className="text-lg pt-1">
              Paying: <span className="font-semibold">{payeeName}</span>
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-baseline gap-2"> {/* Use baseline alignment */}
            <span className="text-3xl font-semibold text-muted-foreground">₹</span>
            <Input
              id="amount-input" // Add id for potential label association
              autoFocus
              type="text" // Use text with inputMode and pattern for better mobile decimal keyboards
              inputMode="decimal"
              pattern="[0-9]*[.,]?[0-9]{0,2}" // Basic pattern
              placeholder="0.00"
              className="flex-1 h-16 text-4xl font-bold text-right pr-4" // Larger, right-aligned
              value={amount}
              onChange={handleAmountChange}
            />
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0"> {/* Ensure vertical stacking */}
          <Button onClick={handleConfirm} className="w-full h-12 text-lg">
            Continue to Google Pay
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full h-12 text-lg">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AmountModal;