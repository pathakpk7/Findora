// User related types
export enum Role {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export enum ItemCategory {
  ELECTRONICS = 'ELECTRONICS',
  PHONE = 'PHONE',
  EARBUDS = 'EARBUDS',
  WATCH = 'WATCH',
  WALLET = 'WALLET',
  CASH = 'CASH',
  BOOK = 'BOOK',
  NOTEBOOK = 'NOTEBOOK',
  ID_CARD = 'ID_CARD',
  STUDENT_CARD = 'STUDENT_CARD',
  KEYS = 'KEYS',
  BAG = 'BAG',
  CLOTHING = 'CLOTHING',
  ACCESSORY = 'ACCESSORY',
  CHARGER = 'CHARGER',
  OTHER = 'OTHER',
}

export enum ItemStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CLAIMED = 'CLAIMED',
  RETURN_PENDING = 'RETURN_PENDING',
  RETURNED = 'RETURNED',
  EXPIRED = 'EXPIRED',
  ARCHIVED = 'ARCHIVED',
}

export enum LostReportStatus {
  ACTIVE = 'ACTIVE',
  MATCHED = 'MATCHED',
  RECOVERED = 'RECOVERED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum ClaimStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum HandoverStatus {
  PENDING = 'PENDING',
  SCANNED = 'SCANNED',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum MatchSource {
  AI = 'AI',
  RULE_BASED = 'RULE_BASED',
}

export enum MatchConfidence {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum NotificationType {
  ITEM_SUBMITTED = 'ITEM_SUBMITTED',
  ITEM_APPROVED = 'ITEM_APPROVED',
  ITEM_REJECTED = 'ITEM_REJECTED',
  CLAIM_SUBMITTED = 'CLAIM_SUBMITTED',
  CLAIM_APPROVED = 'CLAIM_APPROVED',
  CLAIM_REJECTED = 'CLAIM_REJECTED',
  CLAIM_MORE_EVIDENCE = 'CLAIM_MORE_EVIDENCE',
  HANDOVER_CREATED = 'HANDOVER_CREATED',
  HANDOVER_COMPLETED = 'HANDOVER_COMPLETED',
  ITEM_RETURNED = 'ITEM_RETURNED',
  POSSIBLE_MATCH = 'POSSIBLE_MATCH',
  BADGE_EARNED = 'BADGE_EARNED',
  TRUST_SCORE_CHANGED = 'TRUST_SCORE_CHANGED',
  SYSTEM = 'SYSTEM',
}

export enum AuditAction {
  ROLE_CHANGED = 'ROLE_CHANGED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  USER_REACTIVATED = 'USER_REACTIVATED',
  USER_VERIFIED = 'USER_VERIFIED',
  ITEM_APPROVED = 'ITEM_APPROVED',
  ITEM_REJECTED = 'ITEM_REJECTED',
  CLAIM_APPROVED = 'CLAIM_APPROVED',
  CLAIM_REJECTED = 'CLAIM_REJECTED',
  HANDOVER_COMPLETED = 'HANDOVER_COMPLETED',
  TRUST_SCORE_CHANGED = 'TRUST_SCORE_CHANGED',
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  rollNo?: string;
  department?: string;
  year?: number;
  section?: string;
  trustScore: number;
  role: Role;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  rollNo?: string;
  department?: string;
  year?: number;
  section?: string;
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  rollNo?: string;
  department?: string;
  year?: number;
  section?: string;
}

// Auth related types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  rollNo?: string;
  department?: string;
  year?: number;
  section?: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  expiresIn: number;
}

// Profile related types
export interface Profile {
  id: string;
  userId: string;
  bio?: string;
  website?: string;
  location?: string;
  dateOfBirth?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileData {
  bio?: string;
  website?: string;
  location?: string;
  dateOfBirth?: Date;
}

// Found Item types
export interface PublicFoundItem {
  id: string;
  title: string;
  category: ItemCategory;
  publicDescription: string;
  foundLocation: string;
  foundDate: Date;
  status: ItemStatus;
  publicImages: string[];
  foundById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FoundItemVerification {
  id: string;
  foundItemId: string;
  serialNumber?: string;
  hiddenMarks?: string;
  privateIdentifyingInfo?: string;
  privateNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Lost Report types
export interface LostReport {
  id: string;
  reporterId: string;
  title: string;
  category: ItemCategory;
  description: string;
  lostLocation: string;
  lostDate: Date;
  images: string[];
  identifyingCharacteristics?: string;
  status: LostReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Claim types
export interface Claim {
  id: string;
  foundItemId: string;
  claimantId: string;
  evidence: string;
  status: ClaimStatus;
  reviewerId?: string;
  reviewReason?: string;
  reviewedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Handover types
export interface Handover {
  id: string;
  claimId: string;
  tokenHash: string;
  status: HandoverStatus;
  expiresAt: Date;
  generatedAt: Date;
  scannedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  readAt?: Date;
  createdAt: Date;
}

// Trust Score & Badges
export interface TrustScoreHistory {
  id: string;
  userId: string;
  amount: number;
  previousScore: number;
  newScore: number;
  reason: string;
  sourceType?: string;
  sourceId?: string;
  actorId?: string;
  createdAt: Date;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  criteria?: string;
  createdAt: Date;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  badge?: Badge;
}

export interface UserReputationResponse {
  trustScore: number;
  level: number;
  levelName: string;
  nextLevelScore: number;
  progressPercent: number;
  badges: UserBadge[];
  history: TrustScoreHistory[];
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  department?: string;
  trustScore: number;
  level: number;
  levelName: string;
  badgeCount: number;
}

// Audit Log
export interface AuditLog {
  id: string;
  actorId?: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata?: string;
  createdAt: Date;
  actor?: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

// Admin Dashboard & Analytics Types
export interface AdminOverviewAnalytics {
  users: {
    total: number;
    verified: number;
    active: number;
    byRole: Record<string, number>;
    newInPeriod: number;
  };
  foundItems: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    claimed: number;
    returned: number;
    newInPeriod: number;
  };
  lostReports: {
    total: number;
    active: number;
    matched: number;
    recovered: number;
    closed: number;
    cancelled: number;
    newInPeriod: number;
  };
  claims: {
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    completed: number;
    newInPeriod: number;
  };
  handovers: {
    total: number;
    pending: number;
    scanned: number;
    completed: number;
    expired: number;
    cancelled: number;
    newInPeriod: number;
  };
  reputation: {
    avgTrustScore: number;
    maxTrustScore: number;
    badgesAwardedCount: number;
    usersByLevel: Record<string, number>;
  };
}

export interface AdminTrendPoint {
  date: string;
  foundItems: number;
  lostReports: number;
  claims: number;
  handovers: number;
  newUsers: number;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  rollNo?: string;
  department?: string;
  year?: number;
  section?: string;
  trustScore: number;
  role: Role;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Common types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Environment types
export interface DatabaseConfig {
  url: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface AppConfig {
  port: number;
  host: string;
  nodeEnv: string;
  frontendUrl: string;
  database: DatabaseConfig;
  jwt: JwtConfig;
}

// AI Matching Types
export interface LostReportMatchItem {
  id: string;
  lostReportId: string;
  foundItemId: string;
  score: number;
  confidence: MatchConfidence;
  source: MatchSource;
  reasons: string[];
  createdAt: Date;
  updatedAt: Date;
  foundItem: PublicFoundItem;
}

export interface PossibleMatchesResponse {
  lostReportId: string;
  count: number;
  source: MatchSource;
  matches: LostReportMatchItem[];
  disclaimer: string;
}
