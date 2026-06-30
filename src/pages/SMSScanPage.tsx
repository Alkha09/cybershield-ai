import { useState } from 'react';
import { detectSMSPhishing } from '../ml/phishingDetector';
import type { ScanResult } from '../types';
import ScanResultDisplay from '../components/ScanResult';
import ScanningAnimation from '../components/ScanningAnimation';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useScans } from '../context/ScanContext';

export default function SMSScanPage() {
  const { user } = useAuth();
  const { addScan } = useScans();
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'sms' | 'whatsapp'>('sms');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const run = async () => {
    if (!message.trim()) return;
    setScanning(true); setResult(null);
    try {
      const r = await detectSMSPhishing(message, mode, user?.id);
      setResult(r); addScan(r);
    } finally { setScanning(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="text-xs text-slate-400 mb-1">Scanner / SMS & WhatsApp</div>
        <h1 className="text-xl font-semibold text-slate-900">SMS Scanner</h1>
        <p className="text-sm text-slate-500 mt-0.5">Check SMS and WhatsApp messages.</p>
      </div>

      <div className="flex gap-2">
        {(['sms', 'whatsapp'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${mode === m ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
            {m === 'sms' ? 'SMS' : 'WhatsApp'}
          </button>
        ))}
      </div>

      <div className="card p-4">
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={mode === 'whatsapp' ? 'Paste WhatsApp message...' : 'Paste SMS message...'}
          rows={4}
          className="input resize-y"
        />
        <div className="flex justify-end mt-3">
          <button onClick={run} disabled={scanning || !message.trim()} className="btn-primary">
            {scanning ? 'Scanning...' : 'Scan'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {scanning && <ScanningAnimation />}
      {result && !scanning && <ScanResultDisplay result={result} />}
    </div>
  );
}
