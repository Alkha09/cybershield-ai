import { useState } from 'react';
import { useScans } from '../context/ScanContext';
import type { ScanResult } from '../types';
import ScanResultDisplay from '../components/ScanResult';
import { Search, Trash2, Download, X, Filter } from 'lucide-react';

export default function HistoryPage() {
  const { scans, clearHistory } = useScans();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<ScanResult | null>(null);

  const filtered = scans.filter(s => {
    if (filter !== 'all' && s.result !== filter) return false;
    if (q && !s.input.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Scan History</h1>
          <p className="text-sm text-slate-500 mt-0.5">{scans.length} total scans</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {
            const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'scans.json'; a.click();
          }} className="btn-secondary text-xs px-3 py-1.5">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button onClick={() => { if (confirm('Clear all history?')) clearHistory(); }} className="btn-secondary text-xs px-3 py-1.5 text-red-600 border-red-200 hover:bg-red-50">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      <div className="card p-3 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search scans..." className="input pl-9 text-sm" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="input pl-9 w-full sm:w-40 text-sm">
            <option value="all">All results</option>
            <option value="safe">Safe</option>
            <option value="suspicious">Suspicious</option>
            <option value="phishing">Phishing</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-slate-500">No scans found</p>
            <p className="text-xs text-slate-400 mt-1">{scans.length === 0 ? 'Start scanning to build history' : 'Try a different filter'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Type</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Input</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Result</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Confidence</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} onClick={() => setSelected(s)} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-2.5 text-slate-600 capitalize">{s.type}</td>
                  <td className="px-4 py-2.5 text-slate-700 max-w-xs truncate">{s.input}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.result === 'safe' ? 'bg-green-50 text-green-700' :
                      s.result === 'suspicious' ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
                    }`}>{s.result}</span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{Math.round(s.confidence * 100)}%</td>
                  <td className="px-4 py-2.5 text-slate-400 text-xs">{new Date(s.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto">
            <button onClick={() => setSelected(null)} className="absolute top-3 right-3 z-10 p-1.5 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
            <ScanResultDisplay result={selected} />
          </div>
        </div>
      )}
    </div>
  );
}
