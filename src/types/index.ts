export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin?: string;
  totalScans: number;
  threatDetected: number;
}

export interface ScanResult {
  id: string;
  userId: string;
  type: 'url' | 'email' | 'sms' | 'whatsapp' | 'text' | 'screenshot';
  input: string;
  result: 'safe' | 'suspicious' | 'phishing' | 'malicious';
  confidence: number;
  threats: string[];
  details: ScanDetails;
  createdAt: string;
  processingTime: number;
}

export interface ScanDetails {
  urlAnalysis?: URLAnalysis;
  emailAnalysis?: EmailAnalysis;
  textAnalysis?: TextAnalysis;
  mlModel: string;
  modelVersion: string;
  features: Record<string, number>;
}

export interface URLAnalysis {
  url: string;
  domain: string;
  hasHTTPS: boolean;
  hasSuspiciousTLD: boolean;
  urlLength: number;
  hasIPAddress: boolean;
  hasAtSymbol: boolean;
  hasDoubleSlash: boolean;
  subdomainCount: number;
  hasSuspiciousKeywords: boolean;
  domainAge?: string;
  sslValid?: boolean;
}

export interface EmailAnalysis {
  sender: string;
  subject: string;
  hasLinks: boolean;
  linkCount: number;
  hasAttachments: boolean;
  hasUrgency: boolean;
  hasPhishingKeywords: boolean;
  spfValid?: boolean;
  dkimValid?: boolean;
}

export interface TextAnalysis {
  wordCount: number;
  hasUrgency: boolean;
  hasPhishingKeywords: boolean;
  hasSuspiciousLinks: boolean;
  sentimentScore: number;
  threatKeywords: string[];
}

export interface DashboardStats {
  totalScans: number;
  threatsDetected: number;
  safeResults: number;
  suspiciousResults: number;
  scansToday: number;
  avgConfidence: number;
  recentScans: ScanResult[];
  scansByType: { type: string; count: number }[];
  scansByDay: { date: string; safe: number; phishing: number; suspicious: number }[];
  threatDistribution: { name: string; value: number; color: string }[];
}

export type ScanType = 'url' | 'email' | 'sms' | 'whatsapp' | 'text' | 'screenshot';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
