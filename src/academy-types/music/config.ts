import { 
  Users, 
  Calendar, 
  CreditCard, 
  Bell, 
  Music, 
  Award, 
  MessageSquare, 
  FileText, 
  Settings 
} from 'lucide-react';

export const MUSIC_FEATURES = {
  sidebar: [
    { id: 'dashboard', label: 'Dashboard', icon: 'Layout' },
    { id: 'students', label: 'Students', icon: 'Users' },
    { id: 'instructors', label: 'Instructors', icon: 'Users' },
    { id: 'classes', label: 'Classes', icon: 'Layout' },
    { id: 'instruments', label: 'Instruments', icon: 'Music' },
    { id: 'practice', label: 'Practice Tracking', icon: 'FileText' },
    { id: 'recitals', label: 'Recitals', icon: 'Award' },
    { id: 'attendance', label: 'Attendance', icon: 'CheckCircle2' },
    { id: 'fees', label: 'Fees', icon: 'CreditCard' },
    { id: 'reports', label: 'Reports', icon: 'TrendingUp' },
    { id: 'chat', label: 'Chat', icon: 'MessageSquare' },
    { id: 'settings', label: 'Settings', icon: 'Settings' },
  ],
  dashboardCards: [
    'Total Students',
    'Active Classes',
    'Instruments Taught',
    'Upcoming Recitals',
    'Attendance Rate',
    'Pending Fees'
  ]
};
