import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Student } from '../types';
import { Printer, Download, CreditCard, ShieldCheck } from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';

interface NISNBarcodeProps {
  nisn: string;
  studentName?: string;
  className?: string;
  photoUrl?: string;
  displayMode?: 'barcode-only' | 'card';
  onClose?: () => void;
}

export const NISNBarcode: React.FC<NISNBarcodeProps> = ({
  nisn,
  studentName,
  className,
  photoUrl,
  displayMode = 'barcode-only',
  onClose
}) => {
  const barcodeRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (barcodeRef.current && nisn) {
      try {
        JsBarcode(barcodeRef.current, nisn, {
          format: 'CODE128',
          width: 2,
          height: 60,
          displayValue: true,
          font: 'sans-serif',
          fontSize: 14,
          margin: 10,
          lineColor: '#0f172a',
          background: '#ffffff'
        });
      } catch (err) {
        console.error('Error rendering barcode:', err);
      }
    }
  }, [nisn]);

  const handlePrint = () => {
    window.print();
  };

  if (displayMode === 'barcode-only') {
    return (
      <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
        <svg ref={barcodeRef} className="max-w-full"></svg>
        <span className="text-xs font-semibold text-slate-500 tracking-wider">NISN: {nisn}</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-lg">Kartu Barcode Absensi</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 text-sm font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Printable Card Area */}
        <div className="print-area bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

          {/* School Header */}
          <div className="flex items-center gap-3 border-b border-emerald-500/40 pb-3 mb-4">
            <SchoolLogo size={36} />
            <div>
              <h4 className="font-bold text-sm leading-tight tracking-wide text-amber-300 uppercase">
                SMA ISLAM RA'IYATUL HUSNAN
              </h4>
              <p className="text-[10px] text-emerald-100/80">KARTU TANDA NISN / ABSENSI DIGITAL</p>
            </div>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-3 gap-3 mb-4 items-center">
            <div className="col-span-1 flex justify-center">
              <div className="w-20 h-24 rounded-lg bg-emerald-950/60 border border-emerald-400/30 overflow-hidden flex flex-col items-center justify-center text-emerald-200 text-xs font-semibold p-0.5 text-center shadow-xs">
                {photoUrl ? (
                  <img src={photoUrl} alt={studentName || 'Siswa'} className="w-full h-full object-cover rounded-md" />
                ) : (
                  <>
                    <span className="text-2xl mb-1">🎓</span>
                    <span>3x4 PAS FOTO</span>
                  </>
                )}
              </div>
            </div>
            <div className="col-span-2 space-y-1">
              <div>
                <span className="text-[10px] text-emerald-300 uppercase tracking-wider block">Nama Siswa</span>
                <span className="font-bold text-sm text-white line-clamp-1">{studentName || 'Siswa SMA'}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-300 uppercase tracking-wider block">Kelas</span>
                <span className="font-semibold text-xs text-emerald-100">{className || 'X MIPA 1'}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-300 uppercase tracking-wider block">NISN</span>
                <span className="font-mono font-bold text-sm text-amber-300 tracking-wider">{nisn}</span>
              </div>
            </div>
          </div>

          {/* Barcode SVG Container */}
          <div className="bg-white p-2 rounded-lg flex flex-col items-center justify-center shadow-inner">
            <svg ref={barcodeRef} className="max-w-full h-14"></svg>
          </div>

          <div className="mt-3 text-center">
            <span className="text-[9px] text-emerald-200/70 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400 inline" /> Pindai Barcode ini pada Mesin / Kamera Absensi Sekolah
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end mt-5 pt-3 border-t border-slate-100">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Cetak Kartu
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
