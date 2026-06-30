import { useState, useEffect } from 'react';
import { Loader2, FileSearch, Shield, CheckCircle } from 'lucide-react';

const steps = [
  { label: 'Analyzing input', icon: FileSearch },
  { label: 'Extracting features', icon: Loader2 },
  { label: 'Checking patterns', icon: Shield },
  { label: 'Generating report', icon: CheckCircle },
];

export default function ScanningAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => (s + 1) % steps.length);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
        </div>
        <div>
          <div className="text-sm font-medium text-slate-900">Scanning in progress</div>
          <div className="text-xs text-slate-500">Analyzing content for threats...</div>
        </div>
      </div>
      <div className="space-y-2">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isDone = i < step;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700' :
                isDone ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'animate-spin' : ''}`} />
              {s.label}
              {isDone && <span className="ml-auto text-xs text-green-600">Done</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
