'use client';

import React, { useState } from 'react';
import { Academy, PublicCourse } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Clock, 
  CreditCard,
  Music 
} from 'lucide-react';

interface SubjectsManagerProps {
  academyId: string;
  academy: Academy;
  onUpdateAcademy: (updated: Academy) => void;
}

export default function SubjectsManager({
  academyId,
  academy,
  onUpdateAcademy
}: SubjectsManagerProps) {
  const [courses, setCourses] = useState<PublicCourse[]>(academy.coursesList || []);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<PublicCourse | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [fees, setFees] = useState('');

  const isDance = academy.academyType === 'Dance Academy';
  const isMusic = academy.academyType === 'Music Academy';
  
  const labelSubject = isDance ? 'Dance Class Type' : isMusic ? 'Music Lesson Category' : 'Subject';
  const labelTitleSingular = isDance ? 'Class Type' : isMusic ? 'Lesson Category' : 'Subject';
  
  const labelPlaceholderName = isDance 
    ? 'e.g. Contemporary Ballet Beginners' 
    : isMusic 
      ? 'e.g. Classical Piano (Suzuki Method)' 
      : 'e.g. Higher Secondary Algebra (Grade 10)';

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setName('');
    setDescription('');
    setDuration('');
    setFees('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: PublicCourse) => {
    setEditingCourse(c);
    setName(c.name);
    setDescription(c.description);
    setDuration(c.duration);
    setFees(c.fees || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Name is required.');
      return;
    }

    let updatedList: PublicCourse[] = [];
    if (editingCourse) {
      // Edit mode
      updatedList = courses.map((c) => 
        c.id === editingCourse.id 
          ? { ...c, name, description, duration, fees } 
          : c
      );
    } else {
      // Add mode
      const newCourse: PublicCourse = {
        id: 'CRS-' + Math.floor(1000 + Math.random() * 9000),
        name,
        description,
        duration,
        fees
      };
      updatedList = [...courses, newCourse];
    }

    try {
      await updateDoc(doc(db, 'academies', academyId), {
        coursesList: updatedList
      });
      setCourses(updatedList);
      onUpdateAcademy({ ...academy, coursesList: updatedList });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving subject/course:', err);
      alert('Failed to save record.');
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${labelTitleSingular.toLowerCase()} catalogs?`)) return;

    const updatedList = courses.filter((c) => c.id !== courseId);
    try {
      await updateDoc(doc(db, 'academies', academyId), {
        coursesList: updatedList
      });
      setCourses(updatedList);
      onUpdateAcademy({ ...academy, coursesList: updatedList });
    } catch (err) {
      console.error('Error deleting subject/course:', err);
      alert('Failed to delete record.');
    }
  };

  const filtered = courses.filter((c) => {
    const matchName = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDesc = c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchName || matchDesc;
  });

  const accentColor = 'bg-orange-500 hover:bg-orange-600';
  const accentText = 'text-orange-600 bg-orange-50';
  const IconHeader = isDance || isMusic ? Music : BookOpen;

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-slate-900 uppercase">{labelSubject}s Catalog</h3>
          <p className="text-xs text-slate-500">Manage curriculum, skills, styles or instruments taught at your center.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow ${accentColor}`}
        >
          <Plus className="w-4 h-4" /> Add {labelTitleSingular}
        </button>
      </div>

      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-3 flex items-center pr-2">
          <Search className="w-4 h-4 text-slate-400" />
        </span>
        <input
          type="text"
          placeholder={`Search ${labelTitleSingular.toLowerCase()}s...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white focus:outline-none"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <div key={course.id} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-950 text-sm leading-snug">{course.name}</h4>
                    <span className="text-[9px] font-mono font-bold text-slate-400">ID: {course.id}</span>
                  </div>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${accentText}`}>
                    <IconHeader className="w-4 h-4" />
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {course.description || 'No detailed description added.'}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 font-sans">
                <div className="flex flex-wrap gap-4 text-[10px] font-semibold text-slate-600">
                  {course.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{course.duration}</span>
                    </div>
                  )}
                  {course.fees && (
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>{course.fees}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(course)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Course"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60 max-w-md mx-auto">
          <BookOpen className="w-10 h-10 text-slate-250 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No {labelTitleSingular.toLowerCase()}s found</h3>
          <p className="text-slate-400 text-xs mt-1">Publish courses and materials to build a structured prospectus for dancers, musicians, or students.</p>
        </div>
      )}

      {/* Form Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-base font-black text-slate-950 uppercase">
                {editingCourse ? `Edit ${labelTitleSingular}` : `Add New ${labelTitleSingular}`}
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
                  {labelTitleSingular} Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-sans"
                  placeholder={labelPlaceholderName}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Duration / Period</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-sans"
                    placeholder="e.g. 3 Months / Continuous"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Tuition Fees / Cost</label>
                  <input
                    type="text"
                    value={fees}
                    onChange={(e) => setFees(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-sans"
                    placeholder="e.g. $150 per month"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Description syllabus details</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-sans focus:outline-none"
                  placeholder="Outline the content, curriculum, objectives and final expectations of this class module..."
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
                  {editingCourse ? 'Save catalog' : 'Create catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
