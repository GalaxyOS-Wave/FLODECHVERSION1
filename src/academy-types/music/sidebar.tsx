import React from 'react';
import { 
  Sliders, 
  Users, 
  CalendarDays, 
  Music, 
  Award, 
  CheckCircle2, 
  CreditCard, 
  TrendingUp, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  FileText,
  Globe,
  Briefcase,
  Shield
} from 'lucide-react';
import { Academy } from '../../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (val: boolean) => void;
  academy: Academy | null;
  onLogout: () => void;
  logoImg: string;
  setInstLogo: string;
}

export default function MusicSidebar({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  academy,
  onLogout,
  logoImg,
  setInstLogo
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Sliders },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'teachers', label: 'Instructors', icon: Users },
    { id: 'batches', label: 'Classes', icon: CalendarDays },
    { id: 'subjects', label: 'Instruments', icon: Music },
    { id: 'homeworks', label: 'Practice Tracking', icon: FileText },
    { id: 'tests', label: 'Recitals', icon: Award },
    { id: 'attendance', label: 'Attendance', icon: CheckCircle2 },
    { id: 'fees', label: 'Fees & Tuition', icon: CreditCard },
    { id: 'reports', label: 'Student Progress', icon: TrendingUp },
    { id: 'public-profile', label: 'Academy Website', icon: Globe },
    { id: 'portfolio', label: 'Student Portfolios', icon: Briefcase },
    { id: 'chat', label: 'Chat System', icon: MessageSquare },
    { id: 'billing', label: 'Subscription Info', icon: Shield },
    { id: 'settings', label: 'Academy Settings', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col shrink-0 font-sans">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src={logoImg} 
            alt="Flodech Logo" 
            className="w-8 h-8 object-cover rounded-lg bg-white p-1 select-none shadow-md shadow-orange-500/30" 
          />
          <div>
            <span className="text-white font-black text-sm tracking-tight block">Flodech</span>
            <span className="text-[10px] text-orange-400 font-mono tracking-wider font-extrabold uppercase">MUSIC CONSERVATORY</span>
          </div>
        </div>

        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="md:hidden p-1 text-slate-300 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
        </button>
      </div>

      {academy && (
        <div className="p-3 bg-slate-950/40 border-b border-slate-850 flex items-center gap-2.5">
          <img 
            src={setInstLogo || academy.logoUrl || logoImg} 
            alt="Logo" 
            className="w-8 h-8 object-contain rounded-lg bg-white border border-slate-800 p-0.5" 
          />
          <div className="text-[10px] truncate">
            <span className="font-bold text-slate-200 block truncate leading-tight">{academy.institutionName}</span>
            <span className="text-slate-500 font-mono text-[9px]">ID: {academy.id}</span>
          </div>
        </div>
      )}

      <nav className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col flex-grow p-4 space-y-1 overflow-y-auto`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-start px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold gap-3 transition-all cursor-pointer ${
                isActive 
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-start px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold gap-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out Control</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
