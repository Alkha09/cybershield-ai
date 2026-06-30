import { useState, useEffect } from 'react';
import { Shield, Bell, Save, Moon, Sun, Monitor } from 'lucide-react';

type ThemeMode = 'dark' | 'light' | 'system';
interface AppSettings {
  theme: ThemeMode;
  notifications: boolean;
  autoScan: boolean;
  language: string;
  emailAlerts: boolean;
  soundAlerts: boolean;
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  dataSharing: boolean;
  sessionTimeout: string;
  dataRetention: string;
  apiRateLimit: number;
}

const SETTINGS_KEY = 'cybershield_settings';

function loadSettings(): AppSettings {
  try {
    const s = localStorage.getItem(SETTINGS_KEY);
    if (s) return { ...defaults, ...JSON.parse(s) };
  } catch { }
  return defaults;
}

const defaults: AppSettings = {
  theme: 'light',
  notifications: true,
  autoScan: false,
  language: 'en-US',
  emailAlerts: true,
  soundAlerts: false,
  twoFactorEnabled: false,
  loginAlerts: true,
  dataSharing: false,
  sessionTimeout: '30',
  dataRetention: '90',
  apiRateLimit: 100,
};

export default function SettingsPage() {
  const [s, setS] = useState<AppSettings>(loadSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    if (s.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [s]);

  const update = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) => {
    setS(x => ({ ...x, [k]: v }));
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}>
      <span className={`absolute top-[2px] w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
    </button>
  );

  const Section = ({ title, icon: Icon, children }: { title: string; icon: typeof Shield; children: React.ReactNode }) => (
    <div className="card">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <Icon className="w-4 h-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );

  const Row = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-slate-700">{label}</div>
        {desc && <div className="text-xs text-slate-400 mt-0.5">{desc}</div>}
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account preferences</p>
      </div>

      <Section title="Appearance" icon={Monitor}>
        <Row label="Theme" desc="Choose your preferred color scheme">
          <div className="flex gap-2">
            {[
              { value: 'light' as ThemeMode, label: 'Light', icon: Sun },
              { value: 'dark' as ThemeMode, label: 'Dark', icon: Moon },
              { value: 'system' as ThemeMode, label: 'System', icon: Monitor },
            ].map(t => {
              const I = t.icon;
              return (
                <button
                  key={t.value}
                  onClick={() => update('theme', t.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    s.theme === t.value
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <I className="w-3.5 h-3.5" /> {t.label}
                </button>
              );
            })}
          </div>
        </Row>
        <Row label="Language" desc="Interface language">
          <select value={s.language} onChange={e => update('language', e.target.value)} className="input w-40 text-sm py-1.5">
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
          </select>
        </Row>
      </Section>

      <Section title="Notifications" icon={Bell}>
        <Row label="Push notifications" desc="Scan completion alerts">
          <Toggle checked={s.notifications} onChange={() => update('notifications', !s.notifications)} />
        </Row>
        <Row label="Email alerts" desc="Critical threat emails">
          <Toggle checked={s.emailAlerts} onChange={() => update('emailAlerts', !s.emailAlerts)} />
        </Row>
        <Row label="Sound alerts" desc="Audio on threat detection">
          <Toggle checked={s.soundAlerts} onChange={() => update('soundAlerts', !s.soundAlerts)} />
        </Row>
      </Section>

      <Section title="Security" icon={Shield}>
        <Row label="Two-factor authentication" desc={s.twoFactorEnabled ? 'Enabled' : 'Add extra security'}>
          <Toggle checked={s.twoFactorEnabled} onChange={() => update('twoFactorEnabled', !s.twoFactorEnabled)} />
        </Row>
        <Row label="Login alerts" desc="Email on new device sign-in">
          <Toggle checked={s.loginAlerts} onChange={() => update('loginAlerts', !s.loginAlerts)} />
        </Row>
        <Row label="Session timeout" desc="Auto sign-out after inactivity">
          <select value={s.sessionTimeout} onChange={e => update('sessionTimeout', e.target.value)} className="input w-32 text-sm py-1.5">
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="60">1 hour</option>
            <option value="240">4 hours</option>
            <option value="never">Never</option>
          </select>
        </Row>
      </Section>

      <div className="flex justify-end">
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} className="btn-primary">
          <Save className="w-4 h-4" /> {saved ? 'Saved' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
