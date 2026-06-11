'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Upload, 
  X, 
  Check, 
  AlertCircle, 
  FileText, 
  Calendar, 
  Download, 
  Award, 
  User, 
  Search,
  BookOpen
} from 'lucide-react';
import { 
  db, 
  OperationType, 
  handleFirestoreError 
} from '../firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  getDocs 
} from 'firebase/firestore';
import { Homework, HomeworkSubmission, Batch, Student } from '../types';

interface TeacherHomeworksProps {
  academyId: string;
  batches: Batch[];
  students: Student[];
  academyType: string;
}

export default function TeacherHomeworks({ academyId, batches, students, academyType }: TeacherHomeworksProps) {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  
  const isMusic = academyType === 'Music Academy';
  const isDance = academyType === 'Dance Academy';
  
  const themeBgColor = 'bg-orange-500 hover:bg-orange-600';
  const themeText = 'text-orange-600';
  const themeTextLight = 'text-orange-500';
  const themeBgLight = 'bg-orange-50';
  const themeBorder = 'border-orange-500 shadow-orange-500/10';
  const themeBorderLight = 'border-orange-100';
  const themeFocus = 'focus:border-orange-500';
  const themeHover = 'hover:bg-orange-50';
  const themeRing = 'ring-orange-500/20';
  const themeDashedBorder = 'border-orange-500/30';

  const moduleLabel = academyType === 'Coaching / Tuition' ? 'Homework' : 'Event / Competition';
  const getModuleLabel = (type: 'singular' | 'plural') => {
    if (academyType === 'Coaching / Tuition') return type === 'singular' ? 'Homework' : 'Homeworks';
    return type === 'singular' ? 'Event / Competition' : 'Events / Competitions';
  };
  
  const getBatchLabel = () => {
    if (academyType === 'Dance Academy') return 'Target Dance Team';
    if (academyType === 'Music Academy') return 'Target Class';
    return 'Target Batch / Class Group';
  };
  
  // UI States
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Create Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedBatch, setAssignedBatch] = useState('All Batches');
  const [dueDate, setDueDate] = useState('');
  const [attachments, setAttachments] = useState<{name: string, type: string, dataUrl: string}[]>([]);
  const [fileError, setFileError] = useState('');

  // Grading form state
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [gradeValue, setGradeValue] = useState('');
  const [feedbackValue, setFeedbackValue] = useState('');

  // Listeners for homeworks and submissions
  useEffect(() => {
    setLoading(true);
    const homeworkQuery = query(
      collection(db, 'homeworks'),
      where('academyId', '==', academyId)
    );

    const unsubHw = onSnapshot(homeworkQuery, (snap) => {
      const hwList: Homework[] = [];
      snap.forEach((d) => {
        hwList.push({ id: d.id, ...d.data() } as Homework);
      });
      // Sort newest first
      hwList.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setHomeworks(hwList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'homeworks');
      setLoading(false);
    });

    // Submissions
    const submissionsQuery = query(
      collection(db, 'submissions'),
      where('homeworkId', '!=', '') // fetch all, perform side filter of homework in UI state
    );
    // Note: To avoid index requirements, we listen to all and filter in React code
    const unsubSub = onSnapshot(submissionsQuery, (snap) => {
      const subList: HomeworkSubmission[] = [];
      snap.forEach((d) => {
        const data = d.data();
        subList.push({ id: d.id, ...data } as HomeworkSubmission);
      });
      setSubmissions(subList);
    });

    return () => {
      unsubHw();
      unsubSub();
    };
  }, [academyId]);

  // Handle files conversion
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    
    filesArray.forEach((file: File) => {
      // Limit to 800KB to stay well within Firestore document limits (1MB)
      if (file.size > 800 * 1024) {
        setFileError(`File "${file.name}" exceeds the 800KB size limit. Please upload a smaller file.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachments(prev => [...prev, {
            name: file.name,
            type: file.type,
            dataUrl: event.target!.result as string
          }]);
        }
      };
      reader.onerror = () => {
        setFileError(`Failed to read file ${file.name}`);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Homework creation
  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim() || !description.trim() || !dueDate) {
      setErrorMsg('Please fill in title, instructions, and due date.');
      return;
    }

    try {
      const newHw = {
        academyId,
        title: title.trim(),
        description: description.trim(),
        batch: assignedBatch,
        dueDate,
        attachments,
        createdAt: { seconds: Math.floor(Date.now() / 1000) }
      };

      await addDoc(collection(db, 'homeworks'), newHw);
      setSuccessMsg(`${moduleLabel} "${title}" assigned successfully!`);
      
      // Reset Form
      setTitle('');
      setDescription('');
      setAssignedBatch('All Batches');
      setDueDate('');
      setAttachments([]);
      setIsCreating(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed to assign ${moduleLabel.toLowerCase()}: ` + err.message);
    }
  };

  // Delete Homework
  const handleDeleteHomework = async (homeworkId: string) => {
    if (!window.confirm('Are you sure you want to delete this homework? All students submissions for this homework will keep existing but won\'t be listed.')) {
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await deleteDoc(doc(db, 'homeworks', homeworkId));
      if (selectedHomework?.id === homeworkId) {
        setSelectedHomework(null);
      }
      setSuccessMsg(`${moduleLabel} deleted successfully.`);
    } catch (err: any) {
      setErrorMsg(`Failed to delete ${moduleLabel.toLowerCase()}: ` + err.message);
    }
  };

  // Download logic helper
  const handleDownload = (file: {name: string, type: string, dataUrl: string}) => {
    try {
      const link = document.createElement('a');
      link.href = file.dataUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert('Could not download file. Open it from browser inspector.');
    }
  };

  // Update grades
  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmissionId) return;

    setErrorMsg('');
    setSuccessMsg('');
    try {
      const sub = submissions.find(s => s.id === gradingSubmissionId);
      if (!sub) return;

      const updatedSub = {
        ...sub,
        status: 'graded' as const,
        grade: gradeValue.trim(),
        feedback: feedbackValue.trim()
      };

      await setDoc(doc(db, 'submissions', gradingSubmissionId), updatedSub);
      setSuccessMsg('Submission graded successfully!');
      
      // Close modal/grading form
      setGradingSubmissionId(null);
      setGradeValue('');
      setFeedbackValue('');
    } catch (err: any) {
      setErrorMsg('Failed to submit grade: ' + err.message);
    }
  };

  const openGradingDeck = (sub: HomeworkSubmission) => {
    setGradingSubmissionId(sub.id);
    setGradeValue(sub.grade || '');
    setFeedbackValue(sub.feedback || '');
  };

  // Filter submissions for selected Homework
  const homeworkSubmissions = submissions.filter(s => s.homeworkId === selectedHomework?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">{getModuleLabel('plural')}</h1>
          <p className="text-sm text-slate-400">Create, assign and review submissions for {moduleLabel.toLowerCase()} tasks.</p>
        </div>

        <button
          onClick={() => {
            setIsCreating(!isCreating);
            setSelectedHomework(null);
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`${themeBgColor} font-semibold text-white px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition shadow-md cursor-pointer`}
        >
          {isCreating ? <X className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
          {isCreating ? 'Cancel' : `Assign ${moduleLabel}`}
        </button>
      </div>

      {successMsg && (
        <div id="hw-success-banner" className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2.5">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div id="hw-error-banner" className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* CREATE NEW HOMEWORK ASSIGNMENT FORM */}
      {isCreating && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl text-slate-900">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BookOpen className={`w-5 h-5 ${themeTextLight}`} /> Let's Assign {moduleLabel}
          </h2>
          <form onSubmit={handleCreateHomework} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-505 mb-1.5">{moduleLabel} Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Weekly Assessment"
                className={`w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none ${themeFocus} placeholder:text-slate-400`}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-505 mb-1.5">{getBatchLabel()}</label>
                <select
                  value={assignedBatch}
                  onChange={(e) => setAssignedBatch(e.target.value)}
                  className={`w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none ${themeFocus}`}
                >
                  <option value="All Batches">All Batches</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-505 mb-1.5">Submission Deadline</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none ${themeFocus}`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-505 mb-1.5">Submission Instructions</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="List questions, instructions, text prompts to answer..."
                rows={5}
                className={`w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none ${themeFocus} resize-none font-sans placeholder:text-slate-400`}
                required
              />
            </div>

            {/* ATTACHMENTS SECTION */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">{moduleLabel} Attachments</h3>
                  <p className="text-[11px] text-slate-500">Attach PDFs, DOCX, worksheets or files (up to 800KB per file).</p>
                </div>

                <label className={`flex items-center gap-2 text-xs ${themeText} hover:text-white ${themeBgLight} hover:${themeBgColor} font-bold tracking-wider uppercase border border-dashed ${themeDashedBorder} hover:border-transparent px-3 py-1.5 rounded-lg cursor-pointer transition`}>
                  <Upload className="w-3.5 h-3.5"/> Upload File
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xlsx"
                  />
                </label>
              </div>

              {fileError && (
                <p className="text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {fileError}</p>
              )}

              {attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 px-3 py-2 rounded-lg flex items-center justify-between text-xs text-slate-700">
                      <span className="truncate pr-2 font-mono flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">No files attached to this assignment yet.</p>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                type="submit"
                className={`${themeBgColor} text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition cursor-pointer`}
              >
                Publish Assignment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DETAILED GRADING DECK / MODAL POPUP */}
      {gradingSubmissionId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setGradingSubmissionId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className={`w-5 h-5 ${themeTextLight}`} /> Grade Student {moduleLabel}
            </h3>

            <form onSubmit={handleGradeSubmission} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Score / Grade</label>
                <input
                  type="text"
                  value={gradeValue}
                  onChange={(e) => setGradeValue(e.target.value)}
                  placeholder="e.g. A+, 95/100, Excellent"
                  className={`w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none ${themeFocus} placeholder:text-slate-400`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-550 mb-1">Feedback Comments</label>
                <textarea
                  value={feedbackValue}
                  onChange={(e) => setFeedbackValue(e.target.value)}
                  placeholder="Great attempt."
                  rows={4}
                  className={`w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none ${themeFocus} resize-none placeholder:text-slate-400`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingSubmissionId(null)}
                  className="bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-bold uppercase text-slate-600 rounded-lg"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className={`${themeBgColor} px-4 py-2 text-xs font-bold uppercase text-white rounded-lg transition`}
                >
                  Save Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOUBLE PANELS: LIST OF HOMEWORKS + DETAILED VIEW ON CLICK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACTIVE ASSIGNMENTS LIST */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 space-y-4 text-slate-900 shadow-xs">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Active {getModuleLabel('plural')} ({homeworks.length})</h2>

          {loading ? (
            <div className="py-20 text-center text-slate-400 text-sm">Loading assigned {moduleLabel.toLowerCase()}s...</div>
          ) : homeworks.length === 0 ? (
            <div className="py-20 text-center text-slate-500 text-sm italic">No {moduleLabel.toLowerCase()} assigned yet. Click "Assign {moduleLabel}" above to start.</div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {homeworks.map((hw) => {
                const subCount = submissions.filter(s => s.homeworkId === hw.id).length;
                const isSelected = selectedHomework?.id === hw.id;

                return (
                  <div
                    key={hw.id}
                    onClick={() => {
                      setSelectedHomework(hw);
                      setIsCreating(false);
                      setSuccessMsg('');
                      setErrorMsg('');
                    }}
                    className={`p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                      isSelected 
                        ? `${themeBgLight} ${themeBorder} ring-1 ${themeRing}` 
                        : 'bg-slate-50 border-slate-200/60 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] ${themeBgLight} font-bold px-2 py-0.5 rounded ${themeText} border ${themeBorderLight}/50`}>
                        {hw.batch}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Due: {hw.dueDate}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm truncate leading-tight mb-2">
                      {hw.title}
                    </h3>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{hw.attachments?.length || 0} attachments</span>
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 text-[10px] font-semibold">
                        {subCount} submitted
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SUBMISSIONS MATRIX & HOMEWORK DETAIL VIEW */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-5 flex flex-col justify-between text-slate-900 shadow-xs">
          {selectedHomework ? (
            <div className="space-y-5">
              
              {/* TARGET DETAILS */}
              <div className="border-b border-slate-150 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{selectedHomework.title}</h2>
                    <p className="text-xs text-slate-500 mt-1">Assigned group: <strong className="text-slate-800">{selectedHomework.batch}</strong> • Due date: <strong className="text-slate-800">{selectedHomework.dueDate}</strong></p>
                  </div>

                  <button
                    onClick={() => handleDeleteHomework(selectedHomework.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-slate-100 rounded-lg transition"
                    title="Delete HW Setup"
                  >
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>

                <div className="mt-4 bg-slate-50 text-slate-800 text-xs p-3 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed shadow-2xs">
                  {selectedHomework.description}
                </div>

                {selectedHomework.attachments && selectedHomework.attachments.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-1.5">Worksheets & Attachments</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedHomework.attachments.map((file, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleDownload(file)}
                          className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 transition"
                        >
                          <FileText className={`w-3.5 h-3.5 ${themeTextLight} shrink-0`}/>
                          <span className="truncate max-w-[150px] font-semibold">{file.name}</span>
                          <Download className="w-3 h-3 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SUBMISSIONS LISTING */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">Received Work Submissions ({homeworkSubmissions.length})</h3>

                {homeworkSubmissions.length === 0 ? (
                  <div className="bg-slate-50/50 border border-slate-150 text-slate-500 italic p-6 rounded-xl text-center text-xs">
                    No students have submitted this homework assignment yet.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {homeworkSubmissions.map((sub) => (
                      <div key={sub.id} className="bg-slate-50/50 border border-slate-150 rounded-xl p-3.5 space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                            <User className={`w-3.5 h-3.5 ${themeTextLight}`} /> {sub.studentName}
                            <span className="text-[9px] font-mono font-normal text-slate-500">({sub.studentBatch})</span>
                          </span>

                          {sub.status === 'graded' ? (
                            <span className="text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded">
                              Grade: {sub.grade}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-amber-55/65 border border-amber-200 text-amber-700 px-2 py-0.5 rounded">
                              Pending Review
                            </span>
                          )}
                        </div>

                        {sub.textResponse && (
                          <div className="bg-white p-2.5 rounded-lg text-[11px] text-slate-800 whitespace-pre-wrap font-sans border border-slate-200">
                            {sub.textResponse}
                          </div>
                        )}

                        {/* Submission attachments */}
                        {sub.attachments && sub.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {sub.attachments.map((file, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleDownload(file)}
                                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-[10px] px-2 py-1 rounded text-slate-700 transition shadow-2xs"
                              >
                                <FileText className="w-3 h-3 text-emerald-600" />
                                <span className="truncate max-w-[120px] font-semibold">{file.name}</span>
                                <Download className="w-2.5 h-2.5 text-slate-400" />
                              </button>
                            ))}
                          </div>
                        )}

                        {sub.feedback && (
                          <p className={`text-[10px] text-slate-600 italic ${themeBgLight} px-2 py-1.5 border-l-2 ${themeBorder} font-sans`}>
                            <strong>Feedback:</strong> {sub.feedback}
                          </p>
                        )}

                        <div className="text-right pt-1">
                          <button
                            onClick={() => openGradingDeck(sub)}
                            className={`bg-white border border-slate-150 ${themeHover} hover:border-transparent text-[10px] font-bold uppercase tracking-wider ${themeText} px-2.5 py-1 rounded transition cursor-pointer`}
                          >
                            {sub.status === 'graded' ? 'Re-Grade & Feedback' : 'Evaluate Work'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="py-24 text-center text-slate-400 italic text-sm flex flex-col items-center justify-center gap-3">
              <BookOpen className="w-10 h-10 text-slate-300" />
              <span>Select an assignment from the left to view instructions and evaluate student submissions.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
