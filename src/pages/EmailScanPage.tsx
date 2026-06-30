import { useState } from 'react';
import { detectEmailPhishing } from '../ml/phishingDetector';
import type { ScanResult } from '../types';
import ScanResultDisplay from '../components/ScanResult';
import ScanningAnimation from '../components/ScanningAnimation';
import { Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useScans } from '../context/ScanContext';

const samples = [
  { label: 'Phishing sample', content: `From: security@microsft-support.com\nSubject: Your Account Has Been Suspended\n\nDear Valued Customer,\nWe have detected unusual activity on your Microsoft account.\nClick here to verify: http://microsoft-security-verify.xyz/confirm` },
  { label: 'Clean sample', content: `From: sarah.johnson@company.com\nSubject: Team Meeting Tomorrow\n\nHi everyone,\nReminder: team meeting tomorrow at 2 PM in Conference Room B.\nThanks, Sarah` },
];

export default function EmailScanPage() {
  const { user } = useAuth();
  const { addScan } = useScans();
  const [text, setText] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const run = async () => {
    if (!text.trim()) return;
    setScanning(true); setResult(null);
    try {
      const r = await detectEmailPhishing(text, user?.id);
      setResult(r); addScan(r);
    } finally { setScanning(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <Mail className="w-3.5 h-3.5" /> Scanner / Email
        </div>
        <h1 className="text-xl font-semibold text-slate-900">Email Scanner</h1>
        <p className="text-sm text-slate-500 mt-0.5">Paste email content to check for phishing.</p>
      </div>

      <div className="card p-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste email content here..."
          rows={8}
          className="input resize-y font-mono text-sm"
        />
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            {samples.map(s => (
              <button key={s.label} onClick={() => setText(s.content)} className="text-xs px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200">{s.label}</button>
            ))}
          </div>
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
