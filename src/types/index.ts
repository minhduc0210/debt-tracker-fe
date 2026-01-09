export const ContactRole = {
  BORROWER: 'BORROWER',
  LENDER: 'LENDER',
} as const;

export type ContactRole = typeof ContactRole[keyof typeof ContactRole];

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  role: ContactRole;
  balance: number;
  isDeleted: boolean;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  note?: string;
  transactionDate: string;
  contactId: string;
  contact?: {
    name: string;
  };
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}