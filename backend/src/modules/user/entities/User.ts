import { Service } from 'typedi';

@Service()
export class User {
  userId: number;
  passwordHash: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  role: string;
  dob?: Date | null;
  gender?: string | null;
  address?: string | null;
  avatar?: string | null;
  profileUrl?: string | null;
  isVerified: boolean;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
