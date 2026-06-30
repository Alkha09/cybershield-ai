import { useState } from 'react';
import { detectTextPhishing } from '../ml/phishingDetector';
import type { ScanResult } from '../types';
import ScanResultDisplay from '../components/ScanResult';
import ScanningAnimation from '../components/ScanningAnimation';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useScans } from '../context/ScanContext';

export default function TextScanPage() {
  const { user } = useAuth();
  const { addScan } = useScans();
  const [text, setText] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const run = async () => {
    if (!text.trim()) return;
    setScanning(true); setResult(null);
    try { const r = await detectTextPhishing(text, user?.id); setResult(r); addScan(r); }
    finally { setScanning(false); }
  };

  const wc = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="text-xs text-slate-400 mb-1">Scanner / Text</div>
        <h1 className="text-xl font-semibold text-slate-900">Text Scanner</h1>
        <p className="text-sm text-slate-500 mt-0.5">Analyze text content for security threats.</p>
      </div>
      <div className="card p-4">
        <div className="relative">
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste text content here..." rows={8} className="input resize-y pr-16" />
          <div className="absolute bottom-3 right-3 text-xs text-slate-400">{wc} words</div>
        </div>
        <div className="flex justify-end mt-3">
          <button onClick={run} disabled={scanning || !text.trim()} className="btn-primary">
            {scanning ? 'Analyzing...' : 'Analyze'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      {scanning && <ScanningAnimation />}
      {result && !scanning && <ScanResultDisplay result={result} />}
    </div>
  );
}
