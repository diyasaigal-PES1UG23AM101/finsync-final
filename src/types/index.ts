export type UserRole = 'elder' | 'guardian';

export interface User {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  balance?: number;
  guardianId?: string;
}

export type TransactionStatus = 'approved' | 'pending_approval' | 'rejected';

export interface Transaction {
  id: string;
  elderId: string;
  vendor: string;
  amount: number;
  status: TransactionStatus;
  timestamp: Date;
  guardianId?: string;
}
