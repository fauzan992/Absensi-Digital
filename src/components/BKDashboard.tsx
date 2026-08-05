import React from 'react';
import { User, Student, ClassRoom, AttendanceRecord, BKNote } from '../types';
import { BKCounselingSection } from './BKCounselingSection';

interface BKDashboardProps {
  user: User | null;
  students: Student[];
  classes: ClassRoom[];
  attendanceRecords: AttendanceRecord[];
  bkNotes: BKNote[];
  onRefreshData: () => void;
  externalActiveTab?: string;
}

export const BKDashboard: React.FC<BKDashboardProps> = ({
  user,
  students,
  classes,
  attendanceRecords,
  bkNotes,
  onRefreshData
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <BKCounselingSection
        user={user}
        students={students}
        classes={classes}
        attendanceRecords={attendanceRecords}
        bkNotes={bkNotes}
        onRefreshData={onRefreshData}
      />
    </div>
  );
};
