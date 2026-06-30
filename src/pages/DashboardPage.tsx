import { Link } from 'react-router-dom';
import { useScans } from '../context/ScanContext';
import { useAuth } from '../context/AuthContext';
import {
  Link2, Mail, MessageSquare, FileText, Camera,
  ArrowRight, Activity, ShieldCheck, ShieldAlert, ShieldX,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const quickScans = [
  { label: 'URL', icon: Link2, path: '/scan/url', desc: 'Analyze links' },
  { label: 'Email', icon: Mail, path: '/scan/email', desc: 'Check messages' },
  { label: 'SMS', icon: MessageSquare, path: '/scan/sms', desc: 'Detect scams' },
  { label: 'Text', icon: FileText, path: '/scan/text', desc: 'Scan content' },
  { label: 'Image', icon: Camera, path: '/scan/screenshot', desc: 'OCR analysis' },
];

export default function DashboardPage() {
  const { stats } = useScans();
  const { user } = useAuth();
  const hasData = stats.totalScans > 0;

  const chartData = hasData ? stats.scansByDay : [
    { date: 'Mon', safe: 0, phishing: 0, suspicious: 0 },
    { date: 'Tue', safe: 0, phishing: 0, suspicious: 0 },
    { date: 'Wed', safe: 0, phishing: 0, suspicious: 0 },
    { date: 'Thu', safe: 0, phishing: 0, suspicious: 0 },
    { date: 'Fri', safe: 0, phishing: 0, suspicious: 0 },
    { date: 'Sat', safe: 0, phishing: 0, suspicious: 0 },
    { date: 'Sun', safe: 0, phishing: 0, suspicious: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-50 flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">{stats.totalScans}</div>
              <div className="text-xs text-slate-500">Total scans</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-red-50 flex items-center justify-center">
              <ShieldX className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">{stats.threatsDetected}</div>
              <div className="text-xs text-slate-500">Threats found</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-green-50 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">{stats.safeResults}</div>
              <div className="text-xs text-slate-500">Safe results</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-amber-50 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">{stats.scansToday}</div>
              <div className="text-xs text-slate-500">Scans today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick scan + chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick actions */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick scan</h3>
          <div className="space-y-1">
            {quickScans.map(s => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.label}
                  to={s.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-50 transition-colors group"
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                  <div className="flex-1">
                    <div className="text-sm text-slate-700 font-medium">{s.label}</div>
                    <div className="text-xs text-slate-400">{s.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Activity</h3>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="safe" fill="#22c55e" radius={[3,3,0,0]} />
                <Bar dataKey="suspicious" fill="#f59e0b" radius={[3,3,0,0]} />
                <Bar dataKey="phishing" fill="#ef4444" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent scans table */}
      <div className="card">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Recent scans</h3>
          <Link to="/history" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            View all
          </Link>
        </div>
        {stats.recentScans.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-slate-500">No scans yet</p>
            <p className="text-xs text-slate-400 mt-1">Run your first scan to see results here</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Type</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Input</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Result</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Confidence</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Time</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentScans.slice(0, 5).map((s: any) => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-slate-600 capitalize">{s.type}</td>
                  <td className="px-4 py-2.5 text-slate-700 max-w-xs truncate">{s.input}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.result === 'safe' ? 'bg-green-50 text-green-700' :
                      s.result === 'suspicious' ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {s.result}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{Math.round(s.confidence * 100)}%</td>
                  <td className="px-4 py-2.5 text-slate-400 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
