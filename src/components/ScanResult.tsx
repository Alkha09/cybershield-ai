import type { ScanResult as SR } from '../types';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

const cfg: Record<string, { icon: typeof ShieldCheck; color: string; bg: string; label: string }> = {
  safe: { icon: ShieldCheck, color: 'text-green-700', bg: 'bg-green-50', label: 'Safe' },
  suspicious: { icon: ShieldAlert, color: 'text-amber-700', bg: 'bg-amber-50', label: 'Suspicious' },
  phishing: { icon: ShieldX, color: 'text-red-700', bg: 'bg-red-50', label: 'Phishing detected' },
  malicious: { icon: ShieldX, color: 'text-red-700', bg: 'bg-red-50', label: 'Malicious' },
};

export default function ScanResultDisplay({ result }: { result: SR }) {
  const c = cfg[result.result];
  const Icon = c.icon;
  return (
    <div className="card border overflow-hidden">
      <div className={`px-4 py-3 border-b border-slate-100 ${c.bg}`}>
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${c.color}`} />
          <div>
            <div className={`text-sm font-semibold ${c.color}`}>{c.label}</div>
            <div className="text-xs text-slate-500 capitalize">{result.type} scan</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs text-slate-500">Confidence</div>
            <div className="text-sm font-semibold text-slate-900">{(result.confidence * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Input */}
        <div>
          <div className="text-xs font-medium text-slate-500 uppercase mb-1.5">Input</div>
          <div className="text-sm text-slate-700 font-mono bg-slate-50 border border-slate-200 rounded-md px-3 py-2 break-all">
            {result.input}
          </div>
        </div>

        {/* Threats */}
        {result.threats.length > 0 && (
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase mb-2">
              Threats detected ({result.threats.length})
            </div>
            <div className="space-y-1.5">
              {result.threats.map((t, i) => (
                <div key={i} className="text-sm text-slate-700 px-3 py-2 bg-red-50 border border-red-100 rounded-md">
                  {t}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-100">
          <span>Processing: {result.processingTime}ms</span>
          <span>ID: {result.id.slice(-8)}</span>
          <span>{new Date(result.createdAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
