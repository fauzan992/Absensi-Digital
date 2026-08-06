import React, { useState, useEffect } from 'react';
import { User, SchoolSettings } from '../types';
import { apiService } from '../services/apiService';
import { Shield, GraduationCap, Heart, Key, Lock, UserCheck, AlertCircle, Sparkles, Users } from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';

interface LoginModalProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  // 2 main form types: 'staff' (Guru/Admin) and 'wali' (Wali Murid)
  const [formType, setFormType] = useState<'staff' | 'wali'>('staff');
  
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [settings, setSettings] = useState<SchoolSettings | null>(null);

  useEffect(() => {
    apiService.getSettings().then(res => {
      if (res.success && res.settings) {
        setSettings(res.settings);
      }
    });

    const handleSettingsEvent = (e: Event) => {
      const customEvent = e as CustomEvent<SchoolSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      }
    };

    window.addEventListener('school-settings-updated', handleSettingsEvent);
    return () => {
      window.removeEventListener('school-settings-updated', handleSettingsEvent);
    };
  }, []);

  const handleFormTypeChange = (type: 'staff' | 'wali') => {
    setFormType(type);
    setErrorMsg(null);
    if (type === 'staff') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('0061234501');
      setPassword('123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    setLoading(true);
    setErrorMsg(null);

    const activeRole = formType === 'wali' ? 'wali' : 'staff';
    const res = await apiService.login(activeRole, username, formType === 'wali' ? '' : password);
    setLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMsg(res.error || 'Login gagal. Periksa kembali username/NISN dan password Anda.');
    }
  };

  const handleQuickFill = (u: string, p: string, isWali = false) => {
    if (isWali) {
      setFormType('wali');
    } else {
      setFormType('staff');
    }
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Banner Header */}
        <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-900 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex justify-center mb-3">
            <SchoolLogo size={64} />
          </div>
          <h2 className="font-extrabold text-lg tracking-wide uppercase text-amber-300">
            {settings?.namaSekolah || "SMA ISLAM RA'IYATUL HUSNAN"}
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1">Aplikasi Presensi Barcode Digital NISN</p>
        </div>

        <div className="p-6">
          {/* Main 2 Forms Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl mb-5 border border-slate-200/80">
            <button
              type="button"
              onClick={() => handleFormTypeChange('staff')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                formType === 'staff'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <UserCheck className="w-4 h-4 text-amber-300" />
              <span>Guru / Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleFormTypeChange('wali')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                formType === 'wali'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-300" />
              <span>Wali Murid</span>
            </button>
          </div>

          {/* Quick Demo Credentials Helper */}
          <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 inline" /> Kredensial Akses Cepat (Demo):
            </span>
            {formType === 'staff' ? (
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin', 'admin123')}
                  className="text-[10px] font-bold px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg text-amber-900 cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Shield className="w-3 h-3 text-amber-700" /> Admin (admin / admin123)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('ahmad', 'guru123')}
                  className="text-[10px] font-bold px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg text-amber-900 cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <GraduationCap className="w-3 h-3 text-amber-700" /> Guru (ahmad / guru123)
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleQuickFill('0061234501', '', true)}
                className="text-[10px] font-bold px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg text-amber-900 cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Heart className="w-3 h-3 text-rose-600" /> Wali Murid (Coba NISN: 0061234501)
              </button>
            )}
          </div>

          {/* FORM: GURU & ADMIN */}
          {formType === 'staff' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username / NIP
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan Username atau NIP (Cth: admin / ahmad)"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold rounded-xl text-xs shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? 'Memproses Authentikasi...' : (
                  <>
                    <UserCheck className="w-4 h-4 text-amber-300" />
                    <span>MASUK SEBAGAI GURU / ADMIN</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORM: WALI MURID */}
          {formType === 'wali' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-medium flex items-start gap-2.5">
                <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Akses Tanpa Password untuk Wali Murid</p>
                  <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
                    Cukup masukkan NISN putra/putri Anda untuk langsung memantau kehadiran & presensi harian.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  NISN Siswa (Nomor Induk Siswa Nasional)*
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan 10 digit NISN Siswa (Cth: 0061234501)"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-mono text-slate-900"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold rounded-xl text-xs shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? 'Memeriksa NISN Siswa...' : (
                  <>
                    <Heart className="w-4 h-4 text-rose-300" />
                    <span>MASUK LANGSUNG (TANPA PASSWORD)</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

