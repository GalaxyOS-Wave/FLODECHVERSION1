import { 
  Users, 
  Calendar, 
  CreditCard, 
  Bell, 
  Clock, 
  Award, 
  MessageSquare, 
  FileText, 
  Settings 
} from 'lucide-react';

export const COACHING_FEATURES = {
  sidebar: [
    { id: 'dashboard', label: 'Dashboard', icon: 'Sliders' },
    { id: 'students', label: 'Students', icon: 'Users' },
    { id: 'teachers', label: 'Teachers', icon: 'Users' },
    { id: 'batches', label: 'Batches', icon: 'Layers' },
    { id: 'subjects', label: 'Subjects', icon: 'BookOpen' },
    { id: 'homework', label: 'Homework', icon: 'FileText' },
    { id: 'tests', label: 'Tests', icon: 'ClipboardList' },
    { id: 'attendance', label: 'Attendance', icon: 'CheckCircle2' },
    { id: 'fees', label: 'Fees', icon: 'CreditCard' },
    { id: 'reports', label: 'Reports', icon: 'TrendingUp' },
    { id: 'chat', label: 'Chat', icon: 'MessageSquare' },
    { id: 'settings', label: 'Settings', icon: 'Settings' },
  ],
  dashboardCards: [
    'Total Students',
    'Active Batches',
    'Attendance Rate',
    'Pending Fees',
    'Upcoming Tests',
    'Homework Pending',
    'Average Marks',
  ]
};
