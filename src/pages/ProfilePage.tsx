import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useScans } from '../context/ScanContext';
import { User, Mail, Calendar, Edit3, Save, X } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { stats } = useScans();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile({ name, email });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account information</p>
      </div>

      <div className="card">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Account Details</h2>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary text-xs px-3 py-1.5">
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="btn-secondary text-xs px-3 py-1.5">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button onClick={handleSave} className="btn-primary text-xs px-3 py-1.5">
                <Save className="w-3.5 h-3.5" /> Save
              </button>
            </div>
          )}
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xl font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="text-base font-semibold text-slate-900">{user?.name}</div>
              <div className="text-sm text-slate-500">{user?.email}</div>
            </div>
          </div>

          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-slate-500">Name</div>
                  <div className="text-slate-900 font-medium">{user?.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-slate-500">Email</div>
                  <div className="text-slate-900 font-medium">{user?.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-slate-500">Member since</div>
                  <div className="text-slate-900 font-medium">{memberSince}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-slate-500">Role</div>
                  <div className="text-slate-900 font-medium capitalize">{user?.role || 'User'}</div>
                </div>
              </div>
            </div>
          )}

          {saved && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
              Profile updated successfully
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Activity Summary</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold text-slate-900">{stats.totalScans}</div>
              <div className="text-xs text-slate-500 mt-1">Total scans</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">{stats.threatsDetected}</div>
              <div className="text-xs text-slate-500 mt-1">Threats found</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">{stats.safeResults}</div>
              <div className="text-xs text-slate-500 mt-1">Safe results</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
