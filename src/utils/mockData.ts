import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Transaction } from '@/types';

// Helper function to add mock transactions for testing
export async function addMockTransaction(elderId: string, guardianId: string) {
  const vendors = [
    'Grocery Store',
    'Medical Pharmacy',
    'Electricity Bill',
    'Mobile Recharge',
    'Bank Transfer',
    'Online Medicine',
    'Local Shop',
    'Vegetable Market',
    'Doctor Consultation',
    'Temple Donation'
  ];
  
  const amounts = [500, 800, 1200, 1500, 2500, 3000];
  
  const vendor = vendors[Math.floor(Math.random() * vendors.length)];
  const amount = amounts[Math.floor(Math.random() * amounts.length)];
  const status = amount > 1000 ? 'pending_approval' : 'approved';
  
  const transaction = {
    elderId,
    guardianId,
    vendor,
    amount,
    status,
    timestamp: new Date()
  };

  try {
    await addDoc(collection(db, 'transactions'), transaction);
    console.log('Mock transaction added:', transaction);
  } catch (error) {
    console.error('Error adding mock transaction:', error);
  }
}
