'use client';

import React, { useState, useRef } from 'react';
import { Academy, PublicTeacher } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Users, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Upload, 
  Image as ImageIcon 
} from 'lucide-react';

interface InstructorsManagerProps {
  academyId: string;
  academy: Academy;
  onUpdateAcademy: (updated: Academy) => void;
}

export default function InstructorsManager({
  academyId,
  academy,
  onUpdateAcademy
}: InstructorsManagerProps) {
  const [teachers, setTeachers] = useState<PublicTeacher[]>(academy.teachersList || []);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<PublicTeacher | null>(null);
  
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [photo, setPhoto] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDance = academy.academyType === 'Dance Academy';
  const isMusic = academy.academyType === 'Music Academy';
  
  const labelSubject = isDance ? 'Instructor' : isMusic ? 'Instructor/Mentor' : 'Teacher';
  const labelRoles = isDance 
    ? 'e.g. Lead Ballet Instructor, Hip-Hop Choreographer' 
    : isMusic 
      ? 'e.g. Violin Mentor, Classical Piano Teacher' 
      : 'e.g. Mathematics Hod, Science Tutor';
      
  const labelSpecs = isDance 
    ? 'e.g. Contemporary / Jazz / Salsa' 
    : isMusic 
      ? 'e.g. Keyboard / Acoustic Guitar' 
      : 'e.g. Algebra / Physics / Chemistry';

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setName('');
    setRole('');
    setExperience('');
    setSpecialization('');
    setPhoto('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: PublicTeacher) => {
    setEditingTeacher(t);
    setName(t.name);
    setRole(t.role);
    setExperience(t.experience);
    setSpecialization(t.specialization);
    setPhoto(t.photo || '');
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      alert('Name and Role are required.');
      return;
    }

    let updatedList: PublicTeacher[] = [];
    if (editingTeacher) {
      // Edit mode
      updatedList = teachers.map((t) => 
        t.id === editingTeacher.id 
          ? { ...t, name, role, experience, specialization, photo } 
          : t
      );
    } else {
      // Add mode
      const newTeacher: PublicTeacher = {
        id: 'TCH-' + Math.floor(1000 + Math.random() * 9000),
        name,
        role,
        experience,
        specialization,
        photo
      };
      updatedList = [...teachers, newTeacher];
    }

    try {
      await updateDoc(doc(db, 'academies', academyId), {
        teachersList: updatedList
      });
      setTeachers(updatedList);
      onUpdateAcademy({ ...academy, teachersList: updatedList });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving teacher/instructor:', err);
      alert('Failed to save record.');
    }
  };

  const handleDelete = async (teacherId: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${labelSubject.toLowerCase()}?`)) return;

    const updatedList = teachers.filter((t) => t.id !== teacherId);
    try {
      await updateDoc(doc(db, 'academies', academyId), {
        teachersList: updatedList
      });
      setTeachers(updatedList);
      onUpdateAcademy({ ...academy, teachersList: updatedList });
    } catch (err) {
      console.error('Error deleting teacher/instructor:', err);
      alert('Failed to delete record.');
    }
  };

  const filtered = teachers.filter((t) => {
    const matchName = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = t.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSpec = t.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    return matchName || matchRole || matchSpec;
  });

  const accentColor = 'bg-orange-500 hover:bg-orange-600';
  const accentBorder = 'border-orange-200';
  const accentText = 'text-orange-500';

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-slate-900 uppercase">{labelSubject}s Directory</h3>
          <p className="text-xs text-slate-500">Manage teachers, coaches, and staff members of your academy.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow ${accentColor}`}
        >
          <Plus className="w-4 h-4" /> Add {labelSubject}
        </button>
      </div>

      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-3 flex items-center pr-2">
          <Search className="w-4 h-4 text-slate-400" />
        </span>
        <input
          type="text"
          placeholder={`Search ${labelSubject.toLowerCase()}s...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white focus:outline-none"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((teacher) => (
            <div key={teacher.id} className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-4 relative flex flex-col justify-between">
              <div className="flex gap-4 items-start">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-150 relative">
                  {teacher.photo ? (
                    <img 
                      src={teacher.photo} 
                      alt={teacher.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Users className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="font-black text-slate-950 text-sm leading-snug">{teacher.name}</h4>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider leading-none">
                    {teacher.role}
                  </span>
                  {teacher.experience && (
                    <span className="text-[10px] font-mono text-slate-550 block">
                      Exp: {teacher.experience}
                    </span>
                  )}
                </div>
              </div>

              {teacher.specialization && (
                <div className="pt-2 border-t border-slate-50">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Specializations</span>
                  <p className="text-xs font-semibold text-slate-700 truncate mt-0.5">{teacher.specialization}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-50 shrink-0">
                <button
                  onClick={() => handleOpenEdit(teacher)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  title="Edit details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(teacher.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove from roster"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60 max-w-md mx-auto">
          <Users className="w-10 h-10 text-slate-250 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No {labelSubject.toLowerCase()}s found</h3>
          <p className="text-slate-400 text-xs mt-1">Add your academic experts or instructors to showcase in your student panels.</p>
        </div>
      )}

      {/* Form Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border rounded-3xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col justify-between animate-fadeIn">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-base font-black text-slate-950 uppercase">{editingTeacher ? `Edit ${labelSubject}` : `Add New ${labelSubject}`}</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-grow">
              <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 shrink-0">
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer bg-white overflow-hidden hover:border-slate-400 transition-colors relative group shrink-0"
                >
                  {photo ? (
                    <>
                      <img src={photo} alt="Headshot" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-4 h-4 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                      <span className="text-[8px] font-bold text-slate-450 uppercase tracking-wide mt-1">Photo</span>
                    </>
                  )}
                </div>
                <div className="text-[11px] leading-relaxed text-slate-500">
                  <strong className="block text-slate-800 mb-0.5">Profile Headshot / Picture File</strong>
                  Square proportions are recommended. Click the upload block to select a local PNG or JPEG picture file of the staff.
                </div>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="hidden" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                  placeholder="e.g. Master Sarah Jenkins"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Primary Role / Designation *</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                    placeholder={labelRoles}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Years of Experience</label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                    placeholder="e.g. 8+ Years / 15Y"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Specializations & Genres</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                  placeholder={labelSpecs}
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
                  {editingTeacher ? 'Commit Changes' : 'Enroll Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
