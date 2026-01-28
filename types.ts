
export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionStatus = 'APPROVED' | 'PENDING';
export type UserRole = 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'VIEWER';

export enum Category {
  SUBSCRIPTION = 'মাসিক চাঁদা',
  DONATION = 'দান',
  MARRIAGE = 'বিয়ে',
  BOX = 'কৌটা',
  IMAM_HONORARIUM = 'ইমাম হাদিয়া',
  MUAZZIN_HONORARIUM = 'মোয়াজ্জেম হাদিয়া',
  UTILITY = 'কারেন্ট বিল',
  MAINTENANCE = 'রক্ষণাবেক্ষণ',
  OTHERS = 'অন্যান্য খরচ',
  SPECIAL = 'বিশেষ খরচ'
}

export const DEFAULT_LOGO_URL = "https://cdn-icons-png.flaticon.com/512/2319/2319859.png";

export interface Member {
  id: string;
  memberNo: string;
  name: string;
  phone: string;
  designation: string;
  joinDate: string;
  startYear: string;
  startMonth?: number; // New field: 1 = January, 2 = February, etc.
  monthlyAmounts: { [year: string]: number; }; // New field: Year-specific monthly amounts
  password?: string;
  isModerator?: boolean;
  moderatorSerial?: number;
  profileImageUrl?: string; // New field for member profile picture
  homePageBannerUrl?: string; // New field for member's specific dashboard background
  isViewer?: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  calculationDate?: string; // New Field: For accounting period override
  amount: number;
  type: TransactionType;
  category: Category;
  memberId?: string;
  description: string;
  status: TransactionStatus;
  createdBy: string; // User ID or 'ADMIN'
  receiptNo?: string;
}

export interface MosqueState {
  members: Member[];
  transactions: Transaction[];
  lastBackup?: string;
  backupEmail?: string;
  adminPassword?: string;
  homeIconUrl?: string; // New field for custom Home icon
  welcomeAudioUrl?: string; // New field for Welcome Audio
  loginAudioUrl?: string; // New field for Login Success Audio
  adminProfileImageUrl?: string; // NEW: Admin's personal profile image
}
