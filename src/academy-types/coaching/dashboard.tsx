import React from 'react';
import { 
  Users, 
  Layers, 
  CheckCircle2, 
  CreditCard, 
  BookOpen, 
  ClipboardList, 
  FileText, 
  TrendingUp,
  Clock,
  Bell
} from 'lucide-react';
import { Academy, Student, Batch, ClassSchedule, Notice, Fee, AttendanceRecord } from '../../types';

interface CoachingDashboardProps {
  academy: Academy;
  students: Student[];
  batches: Batch[];
  schedules: ClassSchedule[];
  notices: Notice[];
  fees: Fee[];
  attendance: AttendanceRecord[];
}

export default function CoachingDashboard({ 
  academy, 
  students, 
  batches,
  schedules,
  notices,
  fees,
  attendance
}: CoachingDashboardProps) {

  const getAttendanceSummaryPercentage = () => {
    let totalPossibles = 0;
    let presentCount = 0;
    attendance.forEach((rec) => {
      students.forEach((s) => {
        const state = rec.records[s.id];
        if (state) {
          totalPossibles++;
          if (state === 'present' || state === 'late') presentCount++;
        }
      });
    });
    if (totalPossibles === 0) return 100;
    return Math.min(100, Math.round((presentCount / totalPossibles) * 100));
  };

  const getAcademySumPendingFees = () => {
    return fees
      .filter((invoice) => invoice.status === 'pending')
      .reduce((accumulator, invoice) => accumulator + invoice.amount, 0);
  };

  const getRecentNotices = () => notices.slice(0, 3);
  const getUpcomingClasses = () => schedules.slice(0, 4);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Visual Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-lg border border-slate-850">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-2xl mt-[-50px] mr-[-50px]" />
        <div className="relative z-10 space-y-2">
          <span className="text-[10px] text-orange-400 font-mono tracking-widest font-extrabold uppercase">ACADEMY DASHBOARD</span>
          <h1 className="text-3xl font-black tracking-tight">Academy Dashboard</h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
            Track student progress, manage class schedules, view feedback, and monitor pending fee payments easily.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 border border-slate-200/60 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Total Students</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-slate-950">{students.length} Students</span>
            <Users className="w-5 h-5 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 border border-slate-200/60 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Active Batches</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-slate-950">{batches.length} Batches</span>
            <Layers className="w-5 h-5 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white p-6 border border-slate-200/60 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Attendance Rate</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-emerald-600 font-mono">{getAttendanceSummaryPercentage()}%</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white p-6 border border-slate-200/60 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Pending Fees</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-red-500 font-mono">${getAcademySumPendingFees()}</span>
            <CreditCard className="w-5 h-5 text-red-500" />
          </div>
        </div>
      </div>

      {/* Main Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Class Timetable Roster highlights */}
        <div className="bg-white p-6 border border-slate-200/60 rounded-3xl shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Class Schedule</h3>
              <p className="text-[10px] text-slate-400">Timetable for scheduled academy classes</p>
            </div>
            <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-lg font-semibold">{schedules.length} Classes</span>
          </div>
          
          {getUpcomingClasses().length > 0 ? (
            <div className="space-y-3">
              {getUpcomingClasses().map((sch) => (
                <div key={sch.id} className="flex justify-between items-center text-xs p-3.5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100/50 transition-colors">
                  <div className="space-y-0.5">
                    <strong className="text-slate-900 block font-bold text-sm">{sch.className}</strong>
                    <div className="flex items-center gap-2 text-slate-400 font-medium">
                      <span>{sch.batchName}</span>
                      <span>&bull;</span>
                      <span className="font-mono">{sch.dayOfWeek}</span>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-slate-700 bg-white border border-slate-200/80 px-2.5 py-1 rounded-xl font-mono shadow-sm flex items-center gap-1.5"><Clock className="w-3 h-3 text-orange-500"/> {sch.startTime} - {sch.endTime}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-xs text-slate-400">No classes scheduled at this time.</p>
            </div>
          )}
        </div>

        {/* Notices Board Bulletins */}
        <div className="bg-white p-6 border border-slate-200/60 rounded-3xl shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Announcements</h3>
              <p className="text-[10px] text-slate-400">Announcements shared with students</p>
            </div>
            <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg font-semibold">{notices.length} Posts</span>
          </div>

          {getRecentNotices().length > 0 ? (
            <div className="space-y-3">
              {getRecentNotices().map((notice) => (
                <div key={notice.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100/50 transition-colors space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-900 leading-snug truncate max-w-[180px]">{notice.title}</span>
                    <span className="text-[9px] text-slate-400 font-mono font-bold flex items-center gap-1"><Bell className="w-2.5 h-2.5 text-indigo-400"/> {notice.createdAt?.seconds ? new Date(notice.createdAt.seconds * 1000).toLocaleDateString() : 'Date Pending'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{notice.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-xs text-slate-400">No announcements are listed at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
