export type UserRole = 'admin' | 'guru' | 'wali';

export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  nip?: string;
  nisn?: string;
  classId?: string;
  className?: string;
  childNisn?: string;
  childName?: string;
}

export interface Student {
  id: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  classId: string;
  className: string;
  parentName: string;
  parentPhone: string;
  photoUrl?: string;
  defaultPassword?: string;
}

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  gender: 'L' | 'P';
  username: string;
  subject: string;
  assignedClassId?: string;
  assignedClassName?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  gradeLevel: 'X' | 'XI' | 'XII';
  teacherId?: string;
  teacherName?: string;
  studentCount: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  nisn: string;
  studentName: string;
  classId: string;
  className: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss (Waktu Masuk)
  status: AttendanceStatus;
  notes?: string;
  recordedBy: string;
  recordedByRole: string;
  checkOutTime?: string; // HH:mm:ss (Waktu Pulang)
  checkOutStatus?: 'Pulang' | 'Bolos / Pulang Awal' | 'Belum Pulang';
  checkOutBy?: string; // Nama Guru Jam Terakhir
}

export interface AttendanceFilter {
  classId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  search?: string;
}

export interface AttendanceStatSummary {
  totalStudents: number;
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  percentage: number;
}

export interface HolidayConfig {
  id: string;
  date: string; // YYYY-MM-DD
  name: string; // Deskripsi Hari Libur, misal: "HUT Kemerdekaan RI", "Cuti Bersama"
  isNational?: boolean;
}

export interface SchoolSettings {
  jamMasuk: string;       // default: "07:00"
  batasTerlambat: string; // default: "07:15"
  jamPulang: string;      // default: "14:00"
  batasPulang: string;    // default: "16:00"
  hariLiburRutin: number[]; // 0 = Minggu, 6 = Sabtu
  hariLiburKhusus: HolidayConfig[];
  allowAbsenLibur: boolean;
}
