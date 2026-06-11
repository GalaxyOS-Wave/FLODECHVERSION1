import { 
  Users, 
  Calendar, 
  CreditCard, 
  Bell, 
  Layout, 
  Award, 
  MessageSquare, 
  Music, 
  Settings 
} from 'lucide-react';

export const DANCE_FEATURES = {
  sidebar: [
    { id: 'dashboard', label: 'Dashboard', icon: 'Layout' },
    { id: 'dancers', label: 'Dancers', icon: 'Users' },
    { id: 'instructors', label: 'Instructors', icon: 'Users' },
    { id: 'groups', label: 'Dance Groups', icon: 'Layout' },
    { id: 'choreographies', label: 'Choreographies', icon: 'Music' },
    { id: 'events', label: 'Events / Competitions', icon: 'Award' },
    { id: 'attendance', label: 'Attendance', icon: 'CheckCircle2' },
    { id: 'fees', label: 'Fees', icon: 'CreditCard' },
    { id: 'reports', label: 'Reports', icon: 'TrendingUp' },
    { id: 'chat', label: 'Chat', icon: 'MessageSquare' },
    { id: 'settings', label: 'Settings', icon: 'Settings' },
  ],
  dashboardCards: [
    'Total Dancers',
    'Active Groups',
    'Upcoming Events',
    'Upcoming Performances',
    'Attendance Rate',
    'Pending Fees'
  ]
};
