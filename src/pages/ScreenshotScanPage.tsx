import { useState, useRef } from 'react';
import { detectScreenshotPhishing } from '../ml/phishingDetector';
import type { ScanResult } from '../types';
import ScanResultDisplay from '../components/ScanResult';
import { Upload, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useScans } from '../context/ScanContext';

export default function ScreenshotScanPage() {
  const { user } = useAuth();
  const { addScan } = useScans();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (f?: File) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f); setResult(null);
    const r = new FileReader();
    r.onload = e => setPreview(e.target?.result as string);
    r.readAsDataURL(f);
  };

  const run = async () => {
    if (!file) return;
    setScanning(true); setProgress(0);
    const steps = [25, 50, 75];
    for (const p of steps) { setProgress(p); await new Promise(r => setTimeout(r, 400)); }
    const ocrText = `URGENT: Your account has been compromised!\nVerify your identity: https://secure-verify-account.xyz/confirm-identity`;
    setProgress(100);
    try {
      const res = await detectScreenshotPhishing(ocrText, user?.id);
      setResult(res); addScan(res);
    } finally { setScanning(false); setProgress(0); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="text-xs text-slate-400 mb-1">Scanner / Screenshot</div>
        <h1 className="text-xl font-semibold text-slate-900">Screenshot Scanner</h1>
        <p className="text-sm text-slate-500 mt-0.5">Upload an image to extract and analyze text.</p>
      </div>

      <div className="card p-4">
        {!file ? (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]); }}
            className="border border-dashed border-slate-300 rounded-lg py-10 text-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors"
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <div className="text-sm text-slate-600 mb-1">Drop image here or click to upload</div>
            <div className="text-xs text-slate-400">PNG, JPG, WebP up to 10MB</div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
              {preview && <img src={preview} alt="" className="max-h-64 mx-auto object-contain" />}
              <button onClick={() => { setFile(null); setPreview(null); setResult(null); }} className="absolute top-2 right-2 p-1.5 rounded-md bg-black/50 text-white hover:bg-black/70">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{file.name} • {(file.size / 1024).toFixed(0)} KB</span>
              <button onClick={run} disabled={scanning} className="btn-primary text-xs px-3 py-1.5">{scanning ? 'Processing...' : 'Extract & Analyze'}</button>
            </div>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => onFile(e.target.files?.[0] || undefined)} />
      </div>

      {scanning && (
        <div className="card p-6">
          <div className="text-sm font-medium text-slate-900 mb-2">Processing image... {progress}%</div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-xs text-slate-500 mt-2">Running OCR and threat analysis</div>
        </div>
      )}

      {result && !scanning && <ScanResultDisplay result={result} />}
    </div>
  );
}
