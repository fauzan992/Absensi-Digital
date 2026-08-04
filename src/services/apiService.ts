import { User, Student, Teacher, ClassRoom, AttendanceRecord, AttendanceStatus, UserRole, SchoolSettings } from '../types';

export const apiService = {
  // Settings
  async getSettings(): Promise<{ success: boolean; settings?: SchoolSettings; error?: string }> {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return data;
    } catch (err) {
      return { success: false, error: 'Gagal memuat pengaturan presensi.' };
    }
  },

  async updateSettings(settingsData: Partial<SchoolSettings>): Promise<{ success: boolean; settings?: SchoolSettings; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData)
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return data;
    } catch (err) {
      return { success: false, error: 'Gagal memperbarui pengaturan presensi.' };
    }
  },
  // Auth
  async login(role: UserRole, username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login gagal.' };
      }
      return data;
    } catch (err: any) {
      return { success: false, error: 'Terjadi kesalahan koneksi ke server.' };
    }
  },

  // Master Data
  async getMasterData(): Promise<{ classes: ClassRoom[]; teachers: Teacher[]; students: Student[] }> {
    try {
      const res = await fetch('/api/master/data');
      return await res.json();
    } catch (err) {
      return { classes: [], teachers: [], students: [] };
    }
  },

  async addStudent(studentData: Partial<Student>): Promise<{ success: boolean; student?: Student; error?: string; message?: string }> {
    try {
      const res = await fetch('/api/master/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return data;
    } catch (err) {
      return { success: false, error: 'Gagal menambah data siswa.' };
    }
  },

  async updateStudent(id: string, studentData: Partial<Student>): Promise<{ success: boolean; student?: Student; error?: string; message?: string }> {
    try {
      const res = await fetch(`/api/master/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return data;
    } catch (err) {
      return { success: false, error: 'Gagal memperbarui data siswa.' };
    }
  },

  async deleteStudent(id: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const res = await fetch(`/api/master/students/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (err) {
      return { success: false, error: 'Gagal menghapus siswa.' };
    }
  },

  async uploadStudentPhoto(base64Data: string, nisn: string): Promise<{ success: boolean; photoUrl?: string; isSupabase?: boolean; error?: string; message?: string }> {
    try {
      const res = await fetch('/api/upload/student-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data, nisn })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return data;
    } catch (err) {
      return { success: false, error: 'Gagal mengunggah foto siswa.' };
    }
  },

  async addTeacher(teacherData: Partial<Teacher>): Promise<{ success: boolean; teacher?: Teacher; error?: string; message?: string }> {
    try {
      const res = await fetch('/api/master/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData)
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return data;
    } catch (err) {
      return { success: false, error: 'Gagal menambah data guru.' };
    }
  },

  async updateTeacher(id: string, teacherData: Partial<Teacher>): Promise<{ success: boolean; teacher?: Teacher; error?: string; message?: string }> {
    try {
      const res = await fetch(`/api/master/teachers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData)
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return data;
    } catch (err) {
      return { success: false, error: 'Gagal memperbarui data guru.' };
    }
  },

  async deleteTeacher(id: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const res = await fetch(`/api/master/teachers/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (err) {
      return { success: false, error: 'Gagal menghapus guru.' };
    }
  },

  async addClass(classData: Partial<ClassRoom>): Promise<{ success: boolean; class?: ClassRoom; error?: string; message?: string }> {
    try {
      const res = await fetch('/api/master/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData)
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return data;
    } catch (err) {
      return { success: false, error: 'Gagal menambah kelas.' };
    }
  },

  // Attendance Scanning
  async scanBarcode(nisn: string, status: AttendanceStatus = 'Hadir', notes: string = '', recordedBy: string = 'Scan Barcode', recordedByRole: string = 'admin'): Promise<{ success: boolean; record?: AttendanceRecord; student?: Student; error?: string; message?: string }> {
    try {
      const res = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nisn, status, notes, recordedBy, recordedByRole })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return data;
    } catch (err) {
      return { success: false, error: 'Gagal memproses scan barcode.' };
    }
  },

  // Attendance list query
  async getAttendance(params: { classId?: string; startDate?: string; endDate?: string; nisn?: string; status?: string; search?: string }): Promise<{ records: AttendanceRecord[]; total: number }> {
    try {
      const query = new URLSearchParams();
      if (params.classId) query.append('classId', params.classId);
      if (params.startDate) query.append('startDate', params.startDate);
      if (params.endDate) query.append('endDate', params.endDate);
      if (params.nisn) query.append('nisn', params.nisn);
      if (params.status) query.append('status', params.status);
      if (params.search) query.append('search', params.search);

      const res = await fetch(`/api/attendance?${query.toString()}`);
      return await res.json();
    } catch (err) {
      return { records: [], total: 0 };
    }
  },

  // Bulk manual attendance update
  async saveBulkAttendance(records: { nisn: string; status: AttendanceStatus; notes?: string }[], date?: string, recordedBy?: string, recordedByRole?: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/attendance/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records, date, recordedBy, recordedByRole })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: 'Gagal menyimpan presensi.' };
    }
  },

  // Bulk dismissal / checkout attendance update (Guru Jam Terakhir)
  async saveCheckoutAttendance(classId: string, students: { nisn: string; checkedOut: boolean; notes?: string }[], recordedBy: string, date?: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/attendance/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, students, recordedBy, date })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: 'Gagal menyimpan absensi jam pulang.' };
    }
  },

  // Import batch students
  async importStudents(students: any[]): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/import/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: 'Gagal import data siswa.' };
    }
  },

  // Import batch teachers
  async importTeachers(teachers: any[]): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/import/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teachers })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: 'Gagal import data guru.' };
    }
  },

  // Reset database
  async resetData(): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch('/api/reset-data', { method: 'POST' });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  // Google Sheets Integration
  async getSheetsStatus(): Promise<{ spreadsheetId: string | null; spreadsheetUrl: string | null; lastSyncTime: string | null; autoSync: boolean }> {
    try {
      const res = await fetch('/api/sheets/status');
      return await res.json();
    } catch (err) {
      return { spreadsheetId: null, spreadsheetUrl: null, lastSyncTime: null, autoSync: true };
    }
  },

  async initGoogleSheets(accessToken: string, spreadsheetId?: string): Promise<{ success: boolean; spreadsheetId?: string; spreadsheetUrl?: string; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/sheets/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ accessToken, spreadsheetId })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal menyambungkan ke Google Sheets.' };
    }
  },

  async syncToGoogleSheets(accessToken: string, spreadsheetId?: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/sheets/sync-to-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ accessToken, spreadsheetId })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal mengekspor data ke Google Sheets.' };
    }
  },

  async syncFromGoogleSheets(accessToken: string, spreadsheetId?: string): Promise<{ success: boolean; counts?: any; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/sheets/sync-from-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ accessToken, spreadsheetId })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal mengimpor data dari Google Sheets.' };
    }
  }
};
