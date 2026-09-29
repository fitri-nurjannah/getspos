export interface UserDetails {
  id: string;
  name: string;
  userName: string;
  userType: string;
  email: string;
  exp: number;
  iat: number;

  isAdmin: boolean;
  isActive: boolean;
  isEmailVerified: boolean;
  isSubAccountActive: boolean;
  isFirstTimeLoggedIn: boolean;
  isAmountPaid: boolean;
  subscriptionEndDate: Date;
  subAccount: string;
  subAccountId: string;

  subAccountsUsed: number;
  subAccountsLimit: number;
  storageSpaceUsed: number;
  storageSpaceLimit: number;
}

export interface TokenResponse {
  token: string;
}

export interface TokenPayload {
  email?: string;
  password?: string;
  name?: string;
}

export interface SubAccount {
  id?: number;
  name?: string;
  isSlave?: boolean;

  masterId?: number;
  slaveSubAccount?: SubAccount[];
  credential?: Credential;
}

// plan
export interface Plan {
  id?: number | null;
  name: string;
  timePeriod?: string;
  numberOfDisplays?: number;
  isEnterprise?: boolean;
  storageSpace?: string;
  price?: string;
}

export interface Folder {
  id?: number;

  name?: string;

  parentFolderId?: number;
  files?: SliderFile[];

  arbiteryData?: {
    isSelected: boolean;
  };
}

export interface SliderFile {
  youtubeId: string;
  id?: number;
  type?: string;
  iframeSrc?: string;
  originalName?: string;
  nameInDisk?: string;

  folderId?: number;
  userId?: number;
  categoryId?: number;

  videoDuration?: number;
  pdfTotalPages?: number;
  itemChecked?: boolean;

  expiresAt?: string;

  arbiteryData?: {
    isSelected?: boolean;
    timeInterval?: number;
  };
}

//////////////////////////////////////////////////////////

export interface User {
  id: number;
  name: string;
  email: string; // email is used to login
  phoneNo: string;
  address: string;
  hash: string;
  salt: string;

  isActive: boolean;
  isAdmin: boolean;
  isFreeTrialUsed: boolean;
  forgotPasswordActive: boolean;
  isEmailVerified: boolean;
  isSubAccountsActive: boolean;
  isFirstTimeLoggedIn: boolean;

  subscribedPlan: SubscribedPlan;
  credential: Credential;
}

export interface SubscribedPlan {
  id: number;
  planId: number;
  isAmountPaid: boolean;
  usedSpaceInBytes: number;
  endDate: string;
  startDate: string;

  plan: Plan;
}

export interface Credential {
  username: string;
  hash?: string;
  salt?: string;

  userId?: number;
  subAccountId?: number;
}

export interface templateObject {
  blocks: 1 | 2 | null;
  orientation: 'vertical' | 'horizontal' | null;
}

// export interface Plan {
//   id: number;
//   name: string;
//   storageSpace: string;
//   storageSpaceType: string;
//   timePeriodType: string;
//   timePeriod: string;
//   numberOfDisplays: number;
//   isEnterprise: boolean;
//   isAdminProvidedPrice: boolean;
//   price: string;
//   messageFromUser: string;
// }

// export interface UserLimitInfos {
//   subAccountsUsed?: number;
//   subAccountsLimit?: number;
//   storageSpaceUsed?: number;
//   storageSpaceLimit?: number;
// }
