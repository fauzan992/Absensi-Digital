import React, { useState } from 'react';
import { User, Student, AttendanceRecord } from '../types';
import { NISNBarcode } from './NISNBarcode';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import {
  UserCheck, Clock, AlertTriangle, XCircle, Calendar, ShieldCheck,
  CheckCircle2, Barcode, TrendingUp, ChevronRight, Info
} from 'lucide-react';

interface WaliMuridDashboardProps {
  user: User;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
}

export const WaliMuridDashboard: React.FC<WaliMuridDashboardProps> = ({
  user,
  students,
  attendanceRecords
}) => {
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('2026-08');

  // Find child student record
  const student = students.find(s => s.nisn === user.childNisn) || {
    id: 'std-1',
    nisn: user.childNisn || '0061234501',
    name: user.childName || 'Siswa',
    className: user.className || 'X MIPA 1',
    parentName: user.name,
    parentPhone: '-',
    gender: 'L' as 'L'
  };

  const childRecords = attendanceRecords.filter(r => r.nisn === student.nisn);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = childRecords.find(r => r.date === todayStr);

  // Filter records by selected month
  const monthRecords = childRecords.filter(r => r.date.startsWith(selectedMonth));

  // Attendance stats for selected month
  const hadirCount = monthRecords.filter(r => r.status === 'Hadir').length;
  const izinCount = monthRecords.filter(r => r.status === 'Izin').length;
  const sakitCount = monthRecords.filter(r => r.status === 'Sakit').length;
  const alpaCount = monthRecords.filter(r => r.status === 'Alpa').length;

  const totalDays = monthRecords.length || 1;
  const attendancePercentage = Math.round((hadirCount / totalDays) * 100);

  // Data for Recharts Bar Chart
  const chartData = [
    { name: 'Hadir', count: hadirCount, color: '#059669' },
    { name: 'Izin', count: izinCount, color: '#f59e0b' },
    { name: 'Sakit', count: sakitCount, color: '#2563eb' },
    { name: 'Alpa', count: alpaCount, color: '#e11d48' },
  ];

  const pieData = [
    { name: 'Hadir', value: hadirCount, color: '#059669' },
    { name: 'Izin', value: izinCount, color: '#f59e0b' },
    { name: 'Sakit', value: sakitCount, color: '#2563eb' },
    { name: 'Alpa', value: alpaCount, color: '#e11d48' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Student Profile Bento Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-emerald-800">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-20 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg border-2 border-amber-300 shrink-0 overflow-hidden">
              {student.photoUrl ? (
                <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                student.name.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest bg-emerald-950/80 px-3 py-0.5 rounded-full border border-emerald-700/60">
                  DASHBOARD WALI MURID
                </span>
                <span className="text-[10px] text-slate-950 font-extrabold bg-amber-400 px-2.5 py-0.5 rounded-lg">
                  {student.className}
                </span>
              </div>
              <h2 className="text-2xl font-black">{student.name}</h2>
              <p className="text-xs text-emerald-200/90 mt-0.5 font-medium">
                NISN: <span className="font-mono font-bold text-amber-300">{student.nisn}</span> • Orang Tua/Wali:{' '}
                <strong className="text-white">{student.parentName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowBarcodeModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-transform hover:scale-105 cursor-pointer border border-amber-300 shrink-0"
          >
            <Barcode className="w-4 h-4" /> lihat Kartu Barcode NISN
          </button>
        </div>
      </div>

      {/* Real-Time Pemantauan Harian Bento Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
            <h3 className="font-extrabold text-slate-900 text-base">Pemantauan Presensi Harian (Real-Time)</h3>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Hari Ini: {todayStr}
          </span>
        </div>

        {todayRecord ? (
          <div className={`p-5 rounded-2xl border flex items-center gap-4 ${
            todayRecord.status === 'Hadir' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' :
            todayRecord.status === 'Izin' ? 'bg-amber-50/80 border-amber-200 text-amber-900' :
            todayRecord.status === 'Sakit' ? 'bg-blue-50/80 border-blue-200 text-blue-900' :
            'bg-rose-50/80 border-rose-200 text-rose-900'
          }`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              todayRecord.status === 'Hadir' ? 'bg-emerald-600 text-white' :
              todayRecord.status === 'Izin' ? 'bg-amber-500 text-white' :
              todayRecord.status === 'Sakit' ? 'bg-blue-600 text-white' : 'bg-rose-600 text-white'
            }`}>
              {todayRecord.status === 'Hadir' && <CheckCircle2 className="w-6 h-6" />}
              {todayRecord.status === 'Izin' && <Clock className="w-6 h-6" />}
              {todayRecord.status === 'Sakit' && <AlertTriangle className="w-6 h-6" />}
              {todayRecord.status === 'Alpa' && <XCircle className="w-6 h-6" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm uppercase tracking-wider">
                  STATUS HARI INI: {todayRecord.status}
                </span>
                {todayRecord.status === 'Hadir' && (
                  <span className="text-xs bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-lg font-bold font-mono border border-emerald-300">
                    Pukul {todayRecord.time} WIB
                  </span>
                )}
              </div>
              <p className="text-xs font-medium mt-1 leading-relaxed">
                {todayRecord.status === 'Hadir' && `Anak Anda (${student.name}) telah hadir di sekolah SMA Islam Ra'iyatul Husnan pada pukul ${todayRecord.time} WIB.`}
                {todayRecord.status === 'Izin' && `Anak Anda (${student.name}) tercatat Izin hari ini. Keterangan: ${todayRecord.notes || '-'}`}
                {todayRecord.status === 'Sakit' && `Anak Anda (${student.name}) tercatat Sakit hari ini. Keterangan: ${todayRecord.notes || '-'}`}
                {todayRecord.status === 'Alpa' && `Anak Anda (${student.name}) tercatat Alpa (Tanpa Keterangan) hari ini.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 text-slate-600">
            <Info className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <h4 className="font-extrabold text-xs text-slate-800">Siswa Belum Melakukan Pindaian Barcode Hari Ini</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Presensi harian siswa dicatat saat memindai kartu barcode NISN di pos piket gerbang sekolah.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Attendance Statistics & Charts Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Stats Cards */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Persentase Kehadiran</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-emerald-700">{attendancePercentage}%</span>
              <span className="text-xs text-slate-500 font-bold">Tingkat Kehadiran</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${attendancePercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest block">Hadir</span>
              <span className="text-2xl font-black text-emerald-900">{hadirCount} <span className="text-xs font-bold text-emerald-700">Hari</span></span>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
              <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest block">Izin</span>
              <span className="text-2xl font-black text-amber-900">{izinCount} <span className="text-xs font-bold text-amber-700">Hari</span></span>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
              <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-widest block">Sakit</span>
              <span className="text-2xl font-black text-blue-900">{sakitCount} <span className="text-xs font-bold text-blue-700">Hari</span></span>
            </div>
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl">
              <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-widest block">Alpa</span>
              <span className="text-2xl font-black text-rose-900">{alpaCount} <span className="text-xs font-bold text-rose-700">Hari</span></span>
            </div>
          </div>
        </div>

        {/* Right Chart Box Bento Card */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm">Grafik Ringkasan Kehadiran Bulanan</h3>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold bg-white"
            >
              <option value="2026-08">Agustus 2026</option>
              <option value="2026-07">Juli 2026</option>
              <option value="2026-06">Juni 2026</option>
            </select>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any) => [`${value} Hari`, 'Total']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed History Log Table (Read-Only) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Riwayat Log Absensi Detail Siswa</h3>
            <p className="text-xs text-slate-500">Log kehadiran lengkap anak Anda dari waktu ke waktu</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-semibold border border-slate-200">
            Akses Wali Murid (Read-Only)
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500">
              <tr>
                <th className="p-3">No</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Jam Presensi</th>
                <th className="p-3">Status Kehadiran</th>
                <th className="p-3">Keterangan / Catatan</th>
                <th className="p-3">Pencatat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {childRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-xs text-slate-400">
                    Belum ada catatan riwayat absensi.
                  </td>
                </tr>
              ) : (
                childRecords.map((rec, idx) => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-800">{rec.date}</td>
                    <td className="p-3 font-mono text-slate-700">{rec.time} WIB</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        rec.status === 'Hadir' ? 'bg-emerald-100 text-emerald-800' :
                        rec.status === 'Izin' ? 'bg-amber-100 text-amber-800' :
                        rec.status === 'Sakit' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{rec.notes || '-'}</td>
                    <td className="p-3 text-[11px] text-slate-500">{rec.recordedBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Barcode Printable Card Modal */}
      {showBarcodeModal && (
        <NISNBarcode
          nisn={student.nisn}
          studentName={student.name}
          className={student.className}
          displayMode="card"
          onClose={() => setShowBarcodeModal(false)}
        />
      )}
    </div>
  );
};
