import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ScanResult, DashboardStats } from '../types';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

interface ScanContextType {
  scans: ScanResult[];
  stats: DashboardStats;
  refreshScans: () => void;
  clearHistory: () => void;
  addScan: (scan: ScanResult) => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

const SCAN_HISTORY_KEY = 'cybershield_scan_history';

function getLocalScans(userId?: string): ScanResult[] {
  try {
    const stored = localStorage.getItem(SCAN_HISTORY_KEY);
    if (stored) {
      const all = JSON.parse(stored) as ScanResult[];
      if (userId) return all.filter(s => s.userId === userId);
      return all;
    }
  } catch { }
  return [];
}

function storeLocalScan(scan: ScanResult) {
  const scans = getLocalScans();
  scans.unshift(scan);
  if (scans.length > 500) scans.length = 500;
  localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(scans));
}

function clearLocalScans(userId?: string) {
  if (!userId) {
    localStorage.removeItem(SCAN_HISTORY_KEY);
    return;
  }
  const scans = getLocalScans().filter(s => s.userId !== userId);
  localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(scans));
}

function calculateStats(scans: ScanResult[]): DashboardStats {
  const today = new Date().toDateString();
  const scansToday = scans.filter(s => new Date(s.createdAt).toDateString() === today).length;
  const threatsDetected = scans.filter(s => s.result === 'phishing' || s.result === 'malicious').length;
  const safeResults = scans.filter(s => s.result === 'safe').length;
  const suspiciousResults = scans.filter(s => s.result === 'suspicious').length;
  const avgConfidence = scans.length > 0
    ? scans.reduce((acc, s) => acc + s.confidence, 0) / scans.length
    : 0;

  const typeMap: Record<string, number> = {};
  scans.forEach(s => { typeMap[s.type] = (typeMap[s.type] || 0) + 1; });
  const scansByType = Object.entries(typeMap).map(([type, count]) => ({ type, count }));

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const scansByDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toDateString();
    const dayScans = scans.filter(s => new Date(s.createdAt).toDateString() === dayStr);
    return {
      date: dayNames[d.getDay()],
      safe: dayScans.filter(s => s.result === 'safe').length,
      phishing: dayScans.filter(s => s.result === 'phishing' || s.result === 'malicious').length,
      suspicious: dayScans.filter(s => s.result === 'suspicious').length,
    };
  });

  return {
    totalScans: scans.length,
    threatsDetected,
    safeResults,
    suspiciousResults,
    scansToday,
    avgConfidence,
    recentScans: scans.slice(0, 10),
    scansByType,
    scansByDay,
    threatDistribution: [
      { name: 'Safe', value: safeResults, color: '#22c55e' },
      { name: 'Suspicious', value: suspiciousResults, color: '#f59e0b' },
      { name: 'Phishing', value: threatsDetected, color: '#ef4444' },
    ],
  };
}

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [stats, setStats] = useState<DashboardStats>(calculateStats([]));

  const refreshScans = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const history = await api.scan.history();
      setScans(history);
      setStats(calculateStats(history));
    } catch {
      // Backend unavailable - use localStorage
      const local = getLocalScans(user?.id);
      setScans(local);
      setStats(calculateStats(local));
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    refreshScans();
  }, [refreshScans]);

  const addScan = useCallback((scan: ScanResult) => {
    setScans(prev => {
      const updated = [scan, ...prev];
      setStats(calculateStats(updated));
      return updated;
    });
    // Also store locally for fallback
    storeLocalScan(scan);
  }, []);

  const clearHistoryCb = useCallback(async () => {
    try {
      await api.scan.clearHistory();
    } catch {
      // Backend unavailable
    }
    clearLocalScans(user?.id);
    setScans([]);
    setStats(calculateStats([]));
  }, [user?.id]);

  return (
    <ScanContext.Provider value={{ scans, stats, refreshScans, clearHistory: clearHistoryCb, addScan }}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScans() {
  const context = useContext(ScanContext);
  if (!context) throw new Error('useScans must be used within ScanProvider');
  return context;
}
