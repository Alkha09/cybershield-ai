import { useState } from 'react';
import { detectURLPhishing } from '../ml/phishingDetector';
import type { ScanResult } from '../types';
import ScanResultDisplay from '../components/ScanResult';
import ScanningAnimation from '../components/ScanningAnimation';
import { Link2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useScans } from '../context/ScanContext';

export default function URLScanPage() {
  const { user } = useAuth();
  const { addScan } = useScans();
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');

  const handleScan = async () => {
    if (!url.trim()) { setError('Enter a URL'); return; }
    setError(''); setResult(null); setScanning(true);
    try {
      const scanResult = await detectURLPhishing(url, user?.id);
      setResult(scanResult); addScan(scanResult);
    } catch { setError('Scan failed'); }
    finally { setScanning(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <Link2 className="w-3.5 h-3.5" /> Scanner / URL
        </div>
        <h1 className="text-xl font-semibold text-slate-900">URL Scanner</h1>
        <p className="text-sm text-slate-500 mt-0.5">Check any link for phishing and malicious content.</p>
      </div>

      <div className="card p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleScan()}
            placeholder="https://example.com"
            className="input flex-1 font-mono text-sm"
          />
          <button onClick={handleScan} disabled={scanning || !url.trim()} className="btn-primary">
            {scanning ? 'Scanning...' : 'Scan'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        <div className="flex flex-wrap gap-2 mt-3">
          {['https://google.com', 'https://secure-bank-login.xyz/verify', 'https://github.com'].map(ex => (
            <button key={ex} onClick={() => setUrl(ex)} className="text-xs px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200">
              {ex}
            </button>
          ))}
        </div>
      </div>

      {scanning && <ScanningAnimation />}
      {result && !scanning && <ScanResultDisplay result={result} />}
    </div>
  );
}
