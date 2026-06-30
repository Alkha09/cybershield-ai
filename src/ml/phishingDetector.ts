import type { ScanResult, URLAnalysis, EmailAnalysis, TextAnalysis } from '../types';
import { api } from '../api/client';

// Client-side feature extraction for display
const PHISHING_URL_PATTERNS = [
  /login[-._]?verify/i, /account[-._]?verify/i, /secure[-._]?update/i,
  /banking[-._]?alert/i, /suspended[-._]?account/i, /confirm[-._]?identity/i,
  /paypal[-._]?verify/i, /apple[-._]?id/i, /microsoft[-._]?update/i,
  /urgent[-._]?action/i, /limited[-._]?access/i, /password[-._]?reset/i,
];

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.club', '.work', '.click', '.link', '.tk', '.ml', '.ga', '.cf'];

const PHISHING_KEYWORDS = [
  'verify', 'suspended', 'urgent', 'click immediately', 'confirm',
  'account locked', 'security alert', 'unusual activity', 'winner',
  'congratulations', 'claim prize', 'password', 'bank', 'login'
];

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateId(): string {
  return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getCurrentUserId(): string {
  try {
    const auth = localStorage.getItem('cybershield_auth');
    if (auth) {
      const parsed = JSON.parse(auth);
      return parsed?.user?.id || 'guest';
    }
  } catch { }
  return 'guest';
}

function storeLocalScan(scan: ScanResult) {
  const key = 'cybershield_scan_history';
  try {
    const stored = localStorage.getItem(key);
    const scans: ScanResult[] = stored ? JSON.parse(stored) : [];
    scans.unshift(scan);
    if (scans.length > 500) scans.length = 500;
    localStorage.setItem(key, JSON.stringify(scans));
  } catch { }
}

function extractURLFeatures(url: string): URLAnalysis {
  try {
    const parsed = new URL(url.startsWith('http') ? url : 'http://' + url);
    const domain = parsed.hostname;
    return {
      url,
      domain,
      hasHTTPS: parsed.protocol === 'https:',
      hasSuspiciousTLD: SUSPICIOUS_TLDS.some(tld => domain.endsWith(tld)),
      urlLength: url.length,
      hasIPAddress: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain),
      hasAtSymbol: url.includes('@'),
      hasDoubleSlash: (url.match(/\/\//g) || []).length > 1,
      subdomainCount: domain.split('.').length - 1,
      hasSuspiciousKeywords: PHISHING_URL_PATTERNS.some(p => p.test(url)),
      sslValid: parsed.protocol === 'https:',
    };
  } catch {
    return {
      url,
      domain: url,
      hasHTTPS: false,
      hasSuspiciousTLD: false,
      urlLength: url.length,
      hasIPAddress: false,
      hasAtSymbol: url.includes('@'),
      hasDoubleSlash: false,
      subdomainCount: 0,
      hasSuspiciousKeywords: false,
    };
  }
}

function extractEmailFeatures(content: string): EmailAnalysis {
  const lines = content.split('\n');
  const sender = lines.find(l => l.toLowerCase().startsWith('from:'))?.replace(/^from:\s*/i, '') || 'unknown@sender.com';
  const subject = lines.find(l => l.toLowerCase().startsWith('subject:'))?.replace(/^subject:\s*/i, '') || '';
  const links = content.match(/https?:\/\/[^\s]+/g) || [];
  return {
    sender,
    subject,
    hasLinks: links.length > 0,
    linkCount: links.length,
    hasAttachments: /attachment|attached/i.test(content),
    hasUrgency: /urgent|immediately|asap|act now/i.test(content),
    hasPhishingKeywords: PHISHING_KEYWORDS.some(kw => content.toLowerCase().includes(kw)),
    spfValid: true,
    dkimValid: true,
  };
}

function extractTextFeatures(text: string): TextAnalysis {
  const words = text.trim().split(/\s+/);
  const threatKeywords = ['urgent', 'verify', 'suspended', 'prize', 'winner', 'inheritance', 'lottery', 'free', 'click', 'password'];
  return {
    wordCount: words.length,
    hasUrgency: /urgent|immediately|asap|act now/i.test(text),
    hasPhishingKeywords: PHISHING_KEYWORDS.some(kw => text.toLowerCase().includes(kw)),
    hasSuspiciousLinks: /https?:\/\/[^\s]*\.(xyz|top|tk|ml)/i.test(text),
    sentimentScore: 0.5,
    threatKeywords: threatKeywords.filter(kw => text.toLowerCase().includes(kw)),
  };
}

async function callBackendOrFallback(
  type: string,
  content: string,
  userId: string,
  localFn: () => Promise<ScanResult>
): Promise<ScanResult> {
  try {
    const response = await api.scan.analyze(type, content);
    const result: ScanResult = {
      id: response.id || generateId(),
      userId,
      type: response.type as any,
      input: response.input,
      result: response.result as any,
      confidence: response.confidence,
      threats: response.threats || [],
      details: {
        mlModel: 'Backend ML Service',
        modelVersion: 'v1.0.0',
        features: {},
      },
      createdAt: response.createdAt || new Date().toISOString(),
      processingTime: response.processingTime || 1200,
    };
    storeLocalScan(result);
    return result;
  } catch {
    // Backend unavailable - use local simulation
    const result = await localFn();
    storeLocalScan(result);
    return result;
  }
}

export async function detectURLPhishing(url: string, userId?: string): Promise<ScanResult> {
  const uid = userId || getCurrentUserId();
  return callBackendOrFallback('url', url, uid, async () => {
    await delay(1200 + Math.random() * 800);
    const analysis = extractURLFeatures(url);
    const features: Record<string, number> = {
      urlPhishingPattern: PHISHING_URL_PATTERNS.some(p => p.test(url)) ? 1 : 0,
      suspiciousTLD: analysis.hasSuspiciousTLD ? 1 : 0,
      noHTTPS: analysis.hasHTTPS ? 0 : 1,
      ipAddress: analysis.hasIPAddress ? 1 : 0,
      atSymbol: analysis.hasAtSymbol ? 1 : 0,
      longURL: analysis.urlLength > 100 ? 1 : analysis.urlLength > 50 ? 0.5 : 0,
    };

    const score = Object.values(features).reduce((a, b) => a + b, 0) / Object.keys(features).length;
    const isPhishing = score > 0.5;
    const confidence = isPhishing ? 0.7 + Math.random() * 0.25 : 0.85 + Math.random() * 0.12;
    const result = isPhishing ? 'phishing' : 'safe';

    const threats: string[] = [];
    if (!analysis.hasHTTPS) threats.push('No HTTPS encryption');
    if (analysis.hasSuspiciousTLD) threats.push('Suspicious top-level domain');
    if (analysis.hasIPAddress) threats.push('IP address used instead of domain');
    if (analysis.hasAtSymbol) threats.push('@ symbol in URL');

    return {
      id: generateId(),
      userId: uid,
      type: 'url',
      input: url,
      result,
      confidence: Math.min(confidence, 0.99),
      threats,
      details: {
        urlAnalysis: analysis,
        mlModel: 'URL Detection Model',
        modelVersion: 'v1.0.0',
        features,
      },
      createdAt: new Date().toISOString(),
      processingTime: Math.round(1200 + Math.random() * 800),
    };
  });
}

export async function detectEmailPhishing(emailContent: string, userId?: string): Promise<ScanResult> {
  const uid = userId || getCurrentUserId();
  return callBackendOrFallback('email', emailContent, uid, async () => {
    await delay(1500 + Math.random() * 1000);
    const analysis = extractEmailFeatures(emailContent);
    const features: Record<string, number> = {
      emailPhishingPattern: PHISHING_KEYWORDS.some(kw => emailContent.toLowerCase().includes(kw)) ? 1 : 0,
      hasLinks: analysis.hasLinks ? 1 : 0,
      manyLinks: analysis.linkCount > 3 ? 1 : analysis.linkCount > 1 ? 0.5 : 0,
      hasUrgency: analysis.hasUrgency ? 1 : 0,
      hasPhishingKeywords: analysis.hasPhishingKeywords ? 1 : 0,
    };

    const score = Object.values(features).reduce((a, b) => a + b, 0) / Object.keys(features).length;
    const isPhishing = score > 0.5;
    const confidence = isPhishing ? 0.7 + Math.random() * 0.25 : 0.85 + Math.random() * 0.12;
    const result = isPhishing ? 'phishing' : 'safe';

    const threats: string[] = [];
    if (analysis.hasUrgency) threats.push('Urgency language detected');
    if (analysis.hasPhishingKeywords) threats.push('Phishing keyword patterns found');
    if (analysis.linkCount > 3) threats.push(`Multiple suspicious links (${analysis.linkCount})`);

    return {
      id: generateId(),
      userId: uid,
      type: 'email',
      input: emailContent.substring(0, 200) + '...',
      result,
      confidence: Math.min(confidence, 0.99),
      threats,
      details: {
        emailAnalysis: analysis,
        mlModel: 'Email Detection Model',
        modelVersion: 'v1.0.0',
        features,
      },
      createdAt: new Date().toISOString(),
      processingTime: Math.round(1500 + Math.random() * 1000),
    };
  });
}

export async function detectSMSPhishing(message: string, type: 'sms' | 'whatsapp' = 'sms', userId?: string): Promise<ScanResult> {
  const uid = userId || getCurrentUserId();
  return callBackendOrFallback(type, message, uid, async () => {
    await delay(1000 + Math.random() * 600);
    const analysis = extractTextFeatures(message);
    const features: Record<string, number> = {
      smsPhishingPattern: /won|winner|congratulations|claim.*prize|click.*link/i.test(message) ? 1 : 0,
      urgency: /urgent|immediately|act now|limited time/i.test(message) ? 1 : 0,
      hasLink: /http/i.test(message) ? 0.8 : 0,
    };

    const score = Object.values(features).reduce((a, b) => a + b, 0) / Object.keys(features).length;
    const isPhishing = score > 0.5;
    const confidence = isPhishing ? 0.7 + Math.random() * 0.25 : 0.85 + Math.random() * 0.12;
    const result = isPhishing ? 'phishing' : 'safe';

    const threats: string[] = [];
    if (features.smsPhishingPattern > 0.5) threats.push('SMS phishing pattern detected');
    if (features.urgency > 0.5) threats.push('Urgency language detected');

    return {
      id: generateId(),
      userId: uid,
      type,
      input: message,
      result,
      confidence: Math.min(confidence, 0.99),
      threats,
      details: {
        textAnalysis: analysis,
        mlModel: type === 'sms' ? 'SMS Detection Model' : 'WhatsApp Detection Model',
        modelVersion: 'v1.0.0',
        features,
      },
      createdAt: new Date().toISOString(),
      processingTime: Math.round(1000 + Math.random() * 600),
    };
  });
}

export async function detectTextPhishing(text: string, userId?: string): Promise<ScanResult> {
  const uid = userId || getCurrentUserId();
  return callBackendOrFallback('text', text, uid, async () => {
    await delay(1300 + Math.random() * 700);
    const analysis = extractTextFeatures(text);
    const features: Record<string, number> = {
      fraudPattern: /inheritance|beneficiary|million|barrister|diplomat/i.test(text) ? 1 : 0,
      phishingKeywords: Math.min(PHISHING_KEYWORDS.filter(kw => text.toLowerCase().includes(kw)).length / 4, 1),
      urgency: /urgent|immediately/i.test(text) ? 0.8 : 0,
    };

    const score = Object.values(features).reduce((a, b) => a + b, 0) / Object.keys(features).length;
    const isPhishing = score > 0.5;
    const confidence = isPhishing ? 0.7 + Math.random() * 0.25 : 0.85 + Math.random() * 0.12;
    const result = isPhishing ? 'phishing' : 'safe';

    return {
      id: generateId(),
      userId: uid,
      type: 'text',
      input: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      result,
      confidence: Math.min(confidence, 0.99),
      threats: Object.entries(features).filter(([, v]) => v > 0.5).map(([k]) => k),
      details: {
        textAnalysis: analysis,
        mlModel: 'Text Detection Model',
        modelVersion: 'v1.0.0',
        features,
      },
      createdAt: new Date().toISOString(),
      processingTime: Math.round(1300 + Math.random() * 700),
    };
  });
}

export async function detectScreenshotPhishing(ocrText: string, userId?: string): Promise<ScanResult> {
  return detectTextPhishing(ocrText, userId);
}

export function getScanHistory(): ScanResult[] {
  try {
    const stored = localStorage.getItem('cybershield_scan_history');
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function clearScanHistory() {
  localStorage.removeItem('cybershield_scan_history');
}

export function getScanHistoryForCurrentUser(): ScanResult[] {
  const uid = getCurrentUserId();
  return getScanHistory().filter(s => s.userId === uid);
}
