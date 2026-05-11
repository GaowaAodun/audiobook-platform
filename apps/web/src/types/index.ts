export type UserRole = 'USER' | 'CONTENT_ADMIN' | 'SUPER_ADMIN';
export type SocialProvider = 'GOOGLE' | 'APPLE' | 'WECHAT' | 'FACEBOOK';
export type Language = 'MANDARIN' | 'CANTONESE' | 'ENGLISH' | 'JAPANESE' | 'KOREAN' | 'OTHER';
export type AccessType = 'FREE' | 'SUBSCRIPTION' | 'PURCHASE' | 'COIN';
export type AgeRating = 'KIDS' | 'TEEN' | 'ADULT';
export type ContentType = 'AUDIOBOOK' | 'PODCAST' | 'COURSE' | 'KIDS_STORY';

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  middleName: string | null;
  avatar: string | null;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  coverUrl: string | null;
}

export interface Tag {
  id: string;
  name: string;
}

export interface AudiobookTag {
  tag: Tag;
}

export interface Chapter {
  id: string;
  audiobookId: string;
  title: string;
  order: number;
  duration: number;
  audioKey: string;
  textContent: string | null;
  isFree: boolean;
  createdAt: string;
}

export interface Audiobook {
  id: string;
  title: string;
  author: string;
  narrator: string | null;
  description: string;
  coverUrl: string | null;
  categoryId: string;
  category: Category;
  language: Language;
  contentType: ContentType;
  accessType: AccessType;
  ageRating: AgeRating;
  originalPrice: number;
  memberPrice: number;
  isPublished: boolean;
  tags: AudiobookTag[];
  chapters?: Chapter[];
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  limit?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
