import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { apiService } from '../services/apiService';
import { AttendanceStatus, Student } from '../types';
import { Camera, Barcode, CheckCircle2, AlertCircle, X, Volume2, UserCheck, RefreshCw } from 'lucide-react';

interface BarcodeScannerModalProps {
  onClose: () => void;
  onSuccessScan?: () => void;
  recordedByRole?: 'admin' | 'guru';
  recordedByName?: string;
  defaultStatus?: AttendanceStatus;
  studentsList?: Student[];
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  onClose,
  onSuccessScan,
  recordedByRole = 'admin',
  recordedByName = 'Petugas Piket',
  defaultStatus = 'Hadir',
  studentsList = []
}) => {
  const [manualNisn, setManualNisn] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>(defaultStatus);
  const [notes, setNotes] = useState('');
  const [scannerMode, setScannerMode] = useState<'camera' | 'usb' | 'manual'>('camera');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<{
    studentName: string;
    nisn: string;
    className: string;
    status: string;
    time: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Play audio beep on successful scan
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz A5 pitch
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      // Audio fallback
    }
  };

  const handleProcessNisn = async (code: string) => {
    if (!code || loading) return;
    const cleanNisn = code.trim();
    if (cleanNisn.length < 3) return;

    setLoading(true);
    setErrorMsg(null);
    setScanResult(null);

    const res = await apiService.scanBarcode(
      cleanNisn,
      selectedStatus,
      notes,
      recordedByName,
      recordedByRole
    );

    setLoading(false);

    if (res.success && res.student && res.record) {
      playBeep();
      setScanResult({
        studentName: res.student.name,
        nisn: res.student.nisn,
        className: res.student.className,
        status: res.record.status,
        time: res.record.time
      });
      setManualNisn('');
      if (onSuccessScan) onSuccessScan();
    } else {
      setErrorMsg(res.error || 'Gagal memproses barcode.');
    }
  };

  // Initialize camera scanner when in camera mode
  useEffect(() => {
    if (scannerMode === 'camera') {
      const scannerId = 'reader-camera';
      const config = {
        fps: 10,
        qrbox: { width: 260, height: 180 },
        rememberLastUsedCamera: true,
        supportedScanTypes: []
      };

      try {
        const scanner = new Html5QrcodeScanner(scannerId, config, false);
        scannerRef.current = scanner;

        scanner.render(
          (decodedText) => {
            handleProcessNisn(decodedText);
          },
          (errorMessage) => {
            // Ignore frame decode noise
          }
        );
      } catch (e) {
        console.error('Failed to init Html5QrcodeScanner:', e);
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error('Failed to clear scanner', err));
      }
    };
  }, [scannerMode]);

  // Focus manual input on mode switch
  useEffect(() => {
    if (scannerMode === 'usb' || scannerMode === 'manual') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [scannerMode]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualNisn) {
      handleProcessNisn(manualNisn);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg leading-tight">Scanner Barcode NISN</h3>
              <p className="text-xs text-slate-500">SMA Islam Ra'iyatul Husnan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl mb-4">
          <button
            onClick={() => setScannerMode('camera')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              scannerMode === 'camera'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Kamera HP/Webcam
          </button>
          <button
            onClick={() => setScannerMode('usb')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              scannerMode === 'usb'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Barcode className="w-3.5 h-3.5" /> Scanner Eksternal
          </button>
          <button
            onClick={() => setScannerMode('manual')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              scannerMode === 'manual'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Input NISN
          </button>
        </div>

        {/* Status Preset Selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Status Kehadiran yang Dicatat:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as AttendanceStatus[]).map((st) => {
              const active = selectedStatus === st;
              let bg = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
              if (active) {
                if (st === 'Hadir') bg = 'bg-emerald-600 text-white border-emerald-600 shadow-xs';
                if (st === 'Izin') bg = 'bg-amber-500 text-white border-amber-500 shadow-xs';
                if (st === 'Sakit') bg = 'bg-blue-600 text-white border-blue-600 shadow-xs';
                if (st === 'Alpa') bg = 'bg-rose-600 text-white border-rose-600 shadow-xs';
              }
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-all text-center cursor-pointer ${bg}`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scanner Body Area */}
        <div className="relative mb-4 min-h-[220px] bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center p-2 border border-slate-800">
          {scannerMode === 'camera' && (
            <div className="w-full">
              <div id="reader-camera" className="w-full overflow-hidden text-white text-xs"></div>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Arahkan barcode kartu NISN siswa ke depan kamera.
              </p>
            </div>
          )}

          {(scannerMode === 'usb' || scannerMode === 'manual') && (
            <form onSubmit={handleManualSubmit} className="w-full max-w-sm p-4 text-center">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
                <Barcode className="w-6 h-6" />
              </div>
              <h4 className="text-white font-semibold text-sm mb-1">
                {scannerMode === 'usb' ? 'Modus Scanner USB / Bluetooth' : 'Ketik NISN Siswa'}
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                {scannerMode === 'usb'
                  ? 'Gunakan alat scanner fisik. Hasil scan akan otomatis terisi dan diproses.'
                  : 'Ketik 10 digit NISN siswa dan tekan Enter.'}
              </p>

              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Masukkan NISN (Cth: 0061234501)"
                  value={manualNisn}
                  onChange={(e) => setManualNisn(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 text-amber-300 font-mono text-center text-sm font-bold rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading || !manualNisn}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  Proses
                </button>
              </div>
            </form>
          )}

          {loading && (
            <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center text-white gap-2 font-medium text-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> Memproses barcode NISN...
            </div>
          )}
        </div>

        {/* Quick Student Suggestions Chips (Useful for demo & manual selection) */}
        {studentsList.length > 0 && (
          <div className="mb-4">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              ⚡ Klik Cepat NISN Siswa (Demo Scan):
            </span>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-100">
              {studentsList.slice(0, 8).map((st) => (
                <button
                  key={st.id}
                  onClick={() => handleProcessNisn(st.nisn)}
                  className="text-[10px] font-medium px-2 py-1 bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 rounded-md transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span className="font-mono text-emerald-600 font-bold">{st.nisn}</span> - {st.name} ({st.className})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Success Alert Popup */}
        {scanResult && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    BERHASIL DICATAT!
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {scanResult.time} WIB
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base mt-0.5">{scanResult.studentName}</h4>
                <div className="flex gap-3 text-xs text-slate-600 mt-1 font-medium">
                  <span>NISN: <strong className="font-mono">{scanResult.nisn}</strong></span>
                  <span>Kelas: <strong>{scanResult.className}</strong></span>
                  <span>Status: <strong className="text-emerald-700">{scanResult.status}</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
