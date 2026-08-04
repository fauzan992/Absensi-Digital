import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { ClassRoom, Teacher, Student, AttendanceRecord, SchoolSettings } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  autoSync: boolean;
  lastSyncTime?: string;
  status: 'connected' | 'disconnected' | 'unconfigured' | 'error';
  errorMessage?: string;
}

const CONFIG_PATH = path.join(process.cwd(), 'data', 'supabase-config.json');
const LOCAL_DB_PATH = path.join(process.cwd(), 'data', 'local-db.json');

// Default config
let currentSupabaseConfig: SupabaseConfig = {
  url: process.env.SUPABASE_URL || 'https://zxnkiqupojwydazkurfv.supabase.co',
  anonKey: process.env.SUPABASE_ANON_KEY || 'sb_publishable_PvMiB0Or-lpYWjVSaa0FeQ_a33a0ISz',
  autoSync: true,
  status: 'connected'
};

// Ensure data folder exists
const ensureDataDir = () => {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Load saved config
export function loadSupabaseConfig(): SupabaseConfig {
  try {
    ensureDataDir();
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      currentSupabaseConfig = { ...currentSupabaseConfig, ...parsed };
    }
  } catch (err) {
    console.error('Error loading Supabase config file:', err);
  }
  return currentSupabaseConfig;
}

// Save config
export function saveSupabaseConfig(config: Partial<SupabaseConfig>): SupabaseConfig {
  ensureDataDir();
  currentSupabaseConfig = { ...currentSupabaseConfig, ...config };
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(currentSupabaseConfig, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving Supabase config file:', err);
  }
  return currentSupabaseConfig;
}

// Save Local DB backup
export function saveLocalDBBackup(data: {
  classes: ClassRoom[];
  teachers: Teacher[];
  students: Student[];
  attendance: AttendanceRecord[];
  settings?: SchoolSettings;
}) {
  try {
    ensureDataDir();
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local db backup:', err);
  }
}

// Read Local DB backup
export function readLocalDBBackup(): {
  classes?: ClassRoom[];
  teachers?: Teacher[];
  students?: Student[];
  attendance?: AttendanceRecord[];
  settings?: SchoolSettings;
} | null {
  try {
    ensureDataDir();
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const content = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading local db backup:', err);
  }
  return null;
}

// Get Supabase Client instance
export function getSupabaseClient(): SupabaseClient | null {
  const cfg = loadSupabaseConfig();
  if (!cfg.url || !cfg.anonKey) {
    return null;
  }
  try {
    return createClient(cfg.url, cfg.anonKey, {
      auth: { persistSession: false }
    });
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

// Check Supabase connection health
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    saveSupabaseConfig({ status: 'unconfigured', errorMessage: 'Supabase URL atau Anon Key belum dikonfigurasi.' });
    return { success: false, message: 'Supabase URL atau Anon Key belum diatur.' };
  }

  try {
    // Ping students table or check health
    const { data, error } = await supabase.from('students').select('id').limit(1);
    if (error) {
      // If table missing or invalid credentials
      if (error.code === 'PGRST301' || error.message.includes('JWT') || error.message.includes('apiKey')) {
        saveSupabaseConfig({ status: 'error', errorMessage: `Autentikasi Supabase Gagal: ${error.message}` });
        return { success: false, message: `Kredensial Supabase tidak valid: ${error.message}` };
      }
      // If table doesn't exist yet, but connection was made
      if (error.code === '42P01') {
        saveSupabaseConfig({ status: 'connected', errorMessage: 'Tabel Supabase belum dibuat. Jalankan SQL setup script.' });
        return { success: true, message: 'Koneksi ke Supabase berhasil! (Tabel belum dibuat, klik Pembuat Tabel SQL).' };
      }
    }
    
    saveSupabaseConfig({ status: 'connected', errorMessage: undefined });
    return { success: true, message: 'Koneksi ke Supabase Database berhasil & aktif!' };
  } catch (err: any) {
    const msg = err.message || 'Gagal terhubung ke Supabase server.';
    saveSupabaseConfig({ status: 'error', errorMessage: msg });
    return { success: false, message: msg };
  }
}

// SQL Schema Generator for Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- SQL Schema Setup for SMA Islam Ra'iyatul Husnan Attendance System

-- 1. Table: classes
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  grade_level TEXT,
  teacher_id TEXT,
  teacher_name TEXT,
  student_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: teachers
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  nip TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  gender TEXT DEFAULT 'L',
  username TEXT NOT NULL,
  subject TEXT,
  assigned_class_id TEXT,
  assigned_class_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table: students
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  nisn TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  gender TEXT DEFAULT 'L',
  class_id TEXT NOT NULL,
  class_name TEXT NOT NULL,
  parent_name TEXT,
  parent_phone TEXT,
  photo_url TEXT,
  default_password TEXT DEFAULT '123',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table: attendance
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  student_id TEXT,
  nisn TEXT NOT NULL,
  student_name TEXT NOT NULL,
  class_id TEXT NOT NULL,
  class_name TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  recorded_by TEXT NOT NULL,
  recorded_by_role TEXT,
  check_out_time TEXT,
  check_out_status TEXT,
  check_out_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Storage Bucket Setup for Student Photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student-photos', 'student-photos', true) 
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) or Allow Public Anon Access
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public anon access to classes" ON classes;
DROP POLICY IF EXISTS "Allow public anon access to teachers" ON teachers;
DROP POLICY IF EXISTS "Allow public anon access to students" ON students;
DROP POLICY IF EXISTS "Allow public anon access to attendance" ON attendance;
DROP POLICY IF EXISTS "Public Storage Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Storage Upload Access" ON storage.objects;

-- Create Policies for Anon Read/Write Access
CREATE POLICY "Allow public anon access to classes" ON classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access to teachers" ON teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access to students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access to attendance" ON attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Storage Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'student-photos');
CREATE POLICY "Public Storage Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'student-photos');
`;

// Upload Student Photo to Supabase Storage Bucket
export async function uploadStudentPhotoToSupabase(
  base64Data: string,
  nisn: string
): Promise<{ success: boolean; url?: string; isSupabase?: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  const cfg = loadSupabaseConfig();

  if (!base64Data) {
    return { success: true, url: '' };
  }

  // If already a remote HTTP URL (from prior Supabase upload), return as is
  if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
    return { success: true, url: base64Data, isSupabase: true };
  }

  // Extract mime type and raw base64 buffer
  const matches = base64Data.match(/^data:(image\/[a-zA-Z0-9\+\-]+);base64,(.+)$/);
  let mimeType = 'image/jpeg';
  let base64Body = base64Data;
  if (matches && matches.length === 3) {
    mimeType = matches[1];
    base64Body = matches[2];
  }

  const fileBuffer = Buffer.from(base64Body, 'base64');
  const ext = mimeType.split('/')[1] || 'jpg';
  const filePath = `pas_foto_${nisn}_${Date.now()}.${ext}`;

  if (supabase && cfg.status === 'connected') {
    try {
      const { data, error } = await supabase.storage
        .from('student-photos')
        .upload(filePath, fileBuffer, {
          contentType: mimeType,
          upsert: true
        });

      if (error) {
        console.warn('Supabase Storage upload note (using base64 fallback):', error.message);
        return { success: true, url: base64Data, isSupabase: false, error: error.message };
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('student-photos')
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        return { success: true, url: publicUrlData.publicUrl, isSupabase: true };
      }
    } catch (err: any) {
      console.warn('Supabase storage upload error:', err?.message || err);
    }
  }

  // Fallback to base64 Data URI if Supabase Storage is unconfigured or unavailable
  return { success: true, url: base64Data, isSupabase: false };
}

// Sync Push local database to Supabase
export async function pushAllToSupabase(data: {
  classes: ClassRoom[];
  teachers: Teacher[];
  students: Student[];
  attendance: AttendanceRecord[];
}): Promise<{ success: boolean; message: string; details?: any }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, message: 'Supabase URL atau Anon Key belum diatur.' };
  }

  try {
    // 1. Classes
    const classesData = data.classes.map(c => ({
      id: c.id,
      name: c.name,
      grade_level: c.gradeLevel,
      teacher_id: c.teacherId || '',
      teacher_name: c.teacherName || '',
      student_count: c.studentCount || 0
    }));

    if (classesData.length > 0) {
      const { error: errClasses } = await supabase.from('classes').upsert(classesData, { onConflict: 'id' });
      if (errClasses) throw new Error(`Tabel classes: ${errClasses.message}`);
    }

    // 2. Teachers
    const teachersData = data.teachers.map(t => ({
      id: t.id,
      nip: t.nip,
      name: t.name,
      gender: t.gender || 'L',
      username: t.username,
      subject: t.subject || 'Mata Pelajaran',
      assigned_class_id: t.assignedClassId || '',
      assigned_class_name: t.assignedClassName || ''
    }));

    if (teachersData.length > 0) {
      const { error: errTeachers } = await supabase.from('teachers').upsert(teachersData, { onConflict: 'id' });
      if (errTeachers) throw new Error(`Tabel teachers: ${errTeachers.message}`);
    }

    // 3. Students
    const studentsData = data.students.map(s => ({
      id: s.id,
      nisn: s.nisn,
      name: s.name,
      gender: s.gender || 'L',
      class_id: s.classId,
      class_name: s.className,
      parent_name: s.parentName || '',
      parent_phone: s.parentPhone || '',
      photo_url: s.photoUrl || '',
      default_password: s.defaultPassword || '123'
    }));

    if (studentsData.length > 0) {
      const { error: errStudents } = await supabase.from('students').upsert(studentsData, { onConflict: 'id' });
      if (errStudents) throw new Error(`Tabel students: ${errStudents.message}`);
    }

    // 4. Attendance
    const attendanceData = data.attendance.map(a => ({
      id: a.id,
      student_id: a.studentId || '',
      nisn: a.nisn,
      student_name: a.studentName,
      class_id: a.classId,
      class_name: a.className,
      date: a.date,
      time: a.time,
      status: a.status,
      notes: a.notes || '',
      recorded_by: a.recordedBy,
      recorded_by_role: a.recordedByRole || 'guru',
      check_out_time: a.checkOutTime || '-',
      check_out_status: a.checkOutStatus || '-',
      check_out_by: a.checkOutBy || '-'
    }));

    if (attendanceData.length > 0) {
      const { error: errAtt } = await supabase.from('attendance').upsert(attendanceData, { onConflict: 'id' });
      if (errAtt) throw new Error(`Tabel attendance: ${errAtt.message}`);
    }

    saveSupabaseConfig({
      lastSyncTime: new Date().toISOString(),
      status: 'connected',
      errorMessage: undefined
    });

    return {
      success: true,
      message: `Berhasil mengekspor data ke Supabase: ${data.students.length} Siswa, ${data.teachers.length} Guru, ${data.classes.length} Kelas, ${data.attendance.length} Absensi.`
    };
  } catch (err: any) {
    console.error('Error pushAllToSupabase:', err);
    saveSupabaseConfig({ status: 'error', errorMessage: err.message });
    return { success: false, message: `Gagal sinkronisasi Supabase: ${err.message}` };
  }
}

// Pull data from Supabase to local store
export async function pullAllFromSupabase(): Promise<{
  success: boolean;
  message: string;
  data?: {
    classes: ClassRoom[];
    teachers: Teacher[];
    students: Student[];
    attendance: AttendanceRecord[];
  };
}> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, message: 'Supabase URL atau Anon Key belum diatur.' };
  }

  try {
    const [resClasses, resTeachers, resStudents, resAtt] = await Promise.all([
      supabase.from('classes').select('*'),
      supabase.from('teachers').select('*'),
      supabase.from('students').select('*'),
      supabase.from('attendance').select('*')
    ]);

    if (resClasses.error) throw new Error(`Classes: ${resClasses.error.message}`);
    if (resTeachers.error) throw new Error(`Teachers: ${resTeachers.error.message}`);
    if (resStudents.error) throw new Error(`Students: ${resStudents.error.message}`);
    if (resAtt.error) throw new Error(`Attendance: ${resAtt.error.message}`);

    const classes: ClassRoom[] = (resClasses.data || []).map(c => ({
      id: c.id,
      name: c.name,
      gradeLevel: c.grade_level || '',
      teacherId: c.teacher_id,
      teacherName: c.teacher_name,
      studentCount: c.student_count || 0
    }));

    const teachers: Teacher[] = (resTeachers.data || []).map(t => ({
      id: t.id,
      nip: t.nip,
      name: t.name,
      gender: (t.gender === 'P' ? 'P' : 'L') as 'L' | 'P',
      username: t.username,
      subject: t.subject || 'Mata Pelajaran',
      assignedClassId: t.assigned_class_id || undefined,
      assignedClassName: t.assigned_class_name || undefined
    }));

    const students: Student[] = (resStudents.data || []).map(s => ({
      id: s.id,
      nisn: s.nisn,
      name: s.name,
      gender: s.gender || 'L',
      classId: s.class_id,
      className: s.class_name,
      parentName: s.parent_name || '',
      parentPhone: s.parent_phone || '',
      photoUrl: s.photo_url || '',
      defaultPassword: s.default_password || '123'
    }));

    const attendance: AttendanceRecord[] = (resAtt.data || []).map(a => ({
      id: a.id,
      studentId: a.student_id,
      nisn: a.nisn,
      studentName: a.student_name,
      classId: a.class_id,
      className: a.class_name,
      date: a.date,
      time: a.time,
      status: a.status,
      notes: a.notes,
      recordedBy: a.recorded_by,
      recordedByRole: a.recorded_by_role,
      checkOutTime: a.check_out_time,
      checkOutStatus: a.check_out_status,
      checkOutBy: a.check_out_by
    }));

    const fetchedData = { classes, teachers, students, attendance };
    saveLocalDBBackup(fetchedData);

    saveSupabaseConfig({
      lastSyncTime: new Date().toISOString(),
      status: 'connected',
      errorMessage: undefined
    });

    return {
      success: true,
      message: `Berhasil mengimpor data dari Supabase: ${students.length} Siswa, ${teachers.length} Guru, ${classes.length} Kelas, ${attendance.length} Record Presensi.`,
      data: fetchedData
    };
  } catch (err: any) {
    console.error('Error pullAllFromSupabase:', err);
    saveSupabaseConfig({ status: 'error', errorMessage: err.message });
    return { success: false, message: `Gagal mengimpor dari Supabase: ${err.message}` };
  }
}
