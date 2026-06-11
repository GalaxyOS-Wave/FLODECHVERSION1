'use client';

import React, { useState } from 'react';
import { Academy, PublicEvent } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Award, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Calendar, 
  Clock 
} from 'lucide-react';

interface EventsManagerProps {
  academyId: string;
  academy: Academy;
  onUpdateAcademy: (updated: Academy) => void;
}

export default function EventsManager({
  academyId,
  academy,
  onUpdateAcademy
}: EventsManagerProps) {
  const [events, setEvents] = useState<PublicEvent[]>(academy.upcomingEventsList || []);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PublicEvent | null>(null);
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');

  const isDance = academy.academyType === 'Dance Academy';
  const isMusic = academy.academyType === 'Music Academy';
  
  const labelHeader = isDance 
    ? 'Events & Stage Shows' 
    : isMusic 
      ? 'Concerts, Recitals & Gigs' 
      : 'Weekly/Monthly Tests & Exams';
      
  const labelDesc = isDance 
    ? 'Construct upcoming schedules for rehearsals, dance stage shows, festivals and contests.' 
    : isMusic 
      ? 'Define student concerts, grand recitals, ensemble gigs or examination benchmarks.' 
      : 'Create test dates, mocks, assessment details, and term exam benchmarks.';
      
  const labelAddBtn = isDance ? 'Add Show' : isMusic ? 'Add Recital / Gig' : 'Add Test / Exam';
  const labelInputTitle = isDance ? 'Event / Show Name' : isMusic ? 'Concert / Recital Name' : 'Test / Assessment Title';
  const labelPlaceholderTitle = isDance 
    ? 'e.g. Winter Ballet Stage Show 2026' 
    : isMusic 
      ? 'e.g. Annual Classical Piano Concert' 
      : 'e.g. Math Mid-Term Assessment - Grade 10';

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setTitle('');
    setDate('');
    setTime('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evt: PublicEvent) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setDate(evt.date);
    setTime(evt.time);
    setDescription(evt.description);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      alert('Title and Date are required.');
      return;
    }

    let updatedList: PublicEvent[] = [];
    if (editingEvent) {
      // Edit mode
      updatedList = events.map((evt) => 
        evt.id === editingEvent.id 
          ? { ...evt, title, date, time, description } 
          : evt
      );
    } else {
      // Add mode
      const newEvent: PublicEvent = {
        id: 'EVT-' + Math.floor(1000 + Math.random() * 9000),
        title,
        date,
        time,
        description
      };
      updatedList = [...events, newEvent];
    }

    try {
      await updateDoc(doc(db, 'academies', academyId), {
        upcomingEventsList: updatedList
      });
      setEvents(updatedList);
      onUpdateAcademy({ ...academy, upcomingEventsList: updatedList });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving event:', err);
      alert('Failed to save record.');
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!window.confirm(`Are you sure you want to clear this schedule?`)) return;

    const updatedList = events.filter((evt) => evt.id !== eventId);
    try {
      await updateDoc(doc(db, 'academies', academyId), {
        upcomingEventsList: updatedList
      });
      setEvents(updatedList);
      onUpdateAcademy({ ...academy, upcomingEventsList: updatedList });
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Failed to delete record.');
    }
  };

  const filtered = events.filter((evt) => {
    const matchTitle = evt.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDesc = evt.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTitle || matchDesc;
  });

  const accentColor = 'bg-orange-500 hover:bg-orange-600';
  const iconBg = 'bg-orange-50 text-orange-600';

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-slate-900 uppercase">{labelHeader}</h3>
          <p className="text-xs text-slate-500">{labelDesc}</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow ${accentColor}`}
        >
          <Plus className="w-4 h-4" /> {labelAddBtn}
        </button>
      </div>

      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-3 flex items-center pr-2">
          <Search className="w-4 h-4 text-slate-400" />
        </span>
        <input
          type="text"
          placeholder="Search items by query..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white focus:outline-none"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((evt) => (
            <div key={evt.id} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-950 text-sm leading-snug">{evt.title}</h4>
                    <span className="text-[9px] font-mono font-bold text-slate-405">ID: {evt.id}</span>
                  </div>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Award className="w-4 h-4" />
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-sans">
                  {evt.description || 'No notes compiled for this schedule.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col space-y-3">
                <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-600 font-mono">
                  {evt.date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(evt.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </div>
                  )}
                  {evt.time && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.time}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(evt)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Schedule"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(evt.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60 max-w-md mx-auto animate-fadeIn">
          <Award className="w-10 h-10 text-slate-250 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No events logged</h3>
          <p className="text-slate-400 text-xs mt-1">Schedule tests or showcase public shows for students to keep their rehearsals perfectly aligned.</p>
        </div>
      )}

      {/* Form Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-base font-black text-slate-950 uppercase">
                {editingEvent ? `Edit Details` : `Schedule New`}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {labelInputTitle} *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-sans"
                  placeholder={labelPlaceholderTitle}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Proposed Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Event/Test Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-sans"
                    placeholder="e.g. 10:00 AM - 12:00 PM / 18:30 IST"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Event Details & Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-sans focus:outline-none"
                  placeholder="Provide details, rules, guidelines, or other information here..."
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow ${accentColor}`}
                >
                  {editingEvent ? 'Commit Schedule' : 'Launch Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
