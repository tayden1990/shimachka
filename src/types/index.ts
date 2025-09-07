// Type definitions for the Leitner system

export interface User {
  id: number;
  username?: string;
  firstName?: string;
  fullName?: string;
  email?: string;
  language: string;
  interfaceLanguage: string; // Language for bot interface
  timezone: string;
  reminderTimes: string[]; // Array of times like ["08:00", "14:00", "20:00"]
  isActive: boolean;
  createdAt: string;
  lastActiveAt: string;
  isRegistrationComplete?: boolean;
  // Admin panel fields
  totalWords?: number;
  studyProgress?: number; // Percentage of correct answers
}

export interface Card {
  id: string;
  userId: number;
  word: string;
  translation: string;
  definition: string;
  sourceLanguage: string;
  targetLanguage: string;
  box: number; // Leitner box number (1-5)
  nextReviewAt: string;
  reviewCount: number;
  correctCount: number;
  createdAt: string;
  updatedAt: string;
  topic?: string;
}

export interface Topic {
  id: string;
  userId: number;
  name: string;
  sourceLanguage: string;
  targetLanguage: string;
  description?: string;
  createdAt: string;
}

export interface ReviewSession {
  id: string;
  userId: number;
  startedAt: string;
  completedAt?: string;
  cardsReviewed: number;
  correctAnswers: number;
  status: 'active' | 'completed' | 'abandoned';
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  entities?: TelegramMessageEntity[];
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface TelegramMessageEntity {
  type: string;
  offset: number;
  length: number;
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

export interface TelegramInlineKeyboard {
  inline_keyboard: TelegramInlineKeyboardButton[][];
}

export interface TelegramInlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface WordExtractionRequest {
  topic: string;
  sourceLanguage: string;
  targetLanguage: string;
  count?: number;
  wordLevel?: string;
  descriptionLanguage?: string;
}

export interface ExtractedWord {
  word: string;
  translation: string;
  definition: string;
  context?: string;
}

export const LANGUAGES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ar': 'Arabic',
  'fa': 'Persian (Farsi)',
  'hi': 'Hindi',
  'tr': 'Turkish',
  'pl': 'Polish',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'uk': 'Ukrainian',
  'el': 'Greek',
  'he': 'Hebrew'
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

export const LEITNER_INTERVALS = {
  1: 1,    // 1 day
  2: 2,    // 2 days
  3: 4,    // 4 days
  4: 8,    // 8 days
  5: 16    // 16 days
} as const;

// Admin-related types
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'admin' | 'moderator';
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface SupportTicket {
  id: string;
  userId: number;
  userEmail?: string;
  userName?: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedTo?: string;
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface DirectMessage {
  id: string;
  adminId?: string;
  userId?: number;
  subject?: string;
  content: string;
  isRead?: boolean;
  sentAt: string;
  readAt?: string;
}

export interface BulkWordAssignment {
  id: string;
  adminId: string;
  words: {
    word: string;
    translation: string;
    definition: string;
    sourceLanguage: string;
    targetLanguage: string;
  }[];
  targetUsers: number[];
  targetUserIds: number[];
  targetType: string;
  sourceLanguage: string;
  targetLanguage: string;
  status: string;
  totalWords: number;
  processedWords: number;
  createdAt: string;
  completedAt?: string;
  notificationSent?: boolean;
  title?: string;
  description?: string;
}

export interface UserActivity {
  id: string;
  userId: number;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalCards: number;
  cardsCreatedToday: number;
  reviewsToday: number;
  openTickets: number;
  resolvedTickets: number;
  avgResponseTime: string;
  userGrowth: number;
  activeGrowth: number;
  cardGrowth: number;
  reviewGrowth: number;
  lastUpdated: string;
}
