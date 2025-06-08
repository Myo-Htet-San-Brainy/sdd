export interface User {
  _id: string;
  username: string;
  password?: string;
  role: string;
  isActive: boolean;
  phoneNumber: string;
  address: string;
  commissionRate: null | number;
}
