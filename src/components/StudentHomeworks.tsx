'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  Download, 
  Upload, 
  X, 
  Check, 
  AlertCircle, 
  BookOpen, 
  CheckCircle, 
  Award,
  ArrowRight
} from 'lucide-react';
import { 
  db, 
  OperationType, 
  handleFirestoreError 
} from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { Homework, HomeworkSubmission, Student } from '../types';

interface StudentHomeworksProps {
  student: Student;
}

export default function StudentHomeworks({ student }: StudentHomeworksProps) {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [selectedHw, setSelectedHw] = useState<Homework | null>(null);

  // UI States
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Submit states
  const [textResponse, setTextResponse] = useState('');
  const [attachments, setAttachments] = useState<{name: string, type: string, dataUrl: string}[]>([]);
  const [fileError, setFileError] = useState('');

  // Fetch homeworks and student's submissions
  useEffect(() => {
    setLoading(true);
    // Listen to all homework for this academy
    const hwQuery = query(
      collection(db, 'homeworks'),
      where('academyId', '==', student.academyId)
    );

    const unsubHw = onSnapshot(hwQuery, (snap) => {
      const allHw: Homework[] = [];
      snap.forEach((d) => {
        allHw.push({ id: d.id, ...d.data() } as Homework);
      });

      // Filter to only those matching student's batch OR targetting 'All Batches'
      const studentBatches = student.batch ? student.batch.split(',').map((b) => b.trim()).filter(Boolean) : [];
      const filteredHw = allHw.filter(
        (hw) => hw.batch === 'All Batches' || studentBatches.includes(hw.batch)
      );

      // Sort newest first
      filteredHw.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      setHomeworks(filteredHw);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'homeworks');
      setLoading(false);
    });

    // Listen to submissions for this student
    const subQuery = query(
      collection(db, 'submissions'),
      where('studentId', '==', student.id)
    );

    const unsubSub = onSnapshot(subQuery, (snap) => {
      const subList: HomeworkSubmission[] = [];
      snap.forEach((d) => {
        subList.push({ id: d.id, ...d.data() } as HomeworkSubmission);
      });
      setSubmissions(subList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'submissions');
    });

    return () => {
      unsubHw();
      unsubSub();
    };
  }, [student.academyId, student.batch, student.id]);

  // Support downloading attached work sheets
  const handleDownload = (file: {name: string, type: string, dataUrl: string}) => {
    try {
      const link = document.createElement('a');
      link.href = file.dataUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert('Could not download file. Access it from file inspector.');
    }
  };

  // Handle local files compression or base64 convert
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);

    filesArray.forEach((file: File) => {
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

  // Submit Homework Solution
  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHw) return;

    setErrorMsg('');
    setSuccessMsg('');

    if (!textResponse.trim() && attachments.length === 0) {
      setErrorMsg('Please write a text response or append some upload files to submit.');
      return;
    }

    try {
      const submissionId = `${selectedHw.id}_${student.id}`;
      const solution: HomeworkSubmission = {
        id: submissionId,
        homeworkId: selectedHw.id,
        studentId: student.id,
        studentName: student.name,
        studentBatch: student.batch,
        textResponse: textResponse.trim(),
        attachments: attachments,
        submittedAt: { seconds: Math.floor(Date.now() / 1000) },
        status: 'pending'
      };

      await setDoc(doc(db, 'submissions', submissionId), solution);
      setSuccessMsg('Your homework solution was submitted successfully!');
      
      // Cleanup submission form state to current view
      setTextResponse('');
      setAttachments([]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to submit homework solution: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">Homework Assignments</h1>
        <p className="text-sm text-slate-400">View tasks, download worksheets, and submit solution reports.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2.5">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: PENDING/GRADED HOMEWORKS */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 space-y-4 text-slate-900 shadow-xs">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Homework Lists ({homeworks.length})</h2>

          {loading ? (
            <div className="py-20 text-center text-slate-400 text-sm">Loading homework sheets...</div>
          ) : homeworks.length === 0 ? (
            <div className="py-20 text-center text-slate-500 text-sm italic">No homework assigned to your cohort yet. Nice work!</div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {homeworks.map((hw) => {
                const sub = submissions.find(s => s.homeworkId === hw.id);
                const isSelected = selectedHw?.id === hw.id;

                let badgeColor = "bg-slate-100 text-slate-605 border border-slate-205";
                let badgeText = "Not Submitted";

                if (sub) {
                  if (sub.status === 'graded') {
                    badgeColor = "bg-emerald-50 text-emerald-700 border border-emerald-200";
                    badgeText = `Graded: ${sub.grade}`;
                  } else {
                    badgeColor = "bg-amber-50 text-amber-700 border border-amber-200";
                    badgeText = "Review Pending";
                  }
                }

                return (
                  <div
                    key={hw.id}
                    onClick={() => {
                      setSelectedHw(hw);
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className={`p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                      isSelected 
                        ? 'bg-orange-50/5 border-orange-500 shadow-xs ring-1 ring-orange-500/20' 
                        : 'bg-slate-50 border-slate-200/60 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badgeColor}`}>
                        {badgeText}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Due: {hw.dueDate}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm truncate leading-tight">
                      {hw.title}
                    </h3>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DETAIL + SUBMISSION FIELD */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-5 text-slate-900 shadow-xs">
          {selectedHw ? (
            <div className="space-y-5">
              
              {/* DETAILS AND INSTRUCTIONS */}
              <div className="border-b border-slate-150 pb-4">
                <span className="text-[10px] bg-orange-500/10 text-orange-600 border border-orange-500/20 font-bold px-2 py-0.5 rounded inline-block mb-2">
                  Due {selectedHw.dueDate}
                </span>

                <h2 className="text-xl font-black text-slate-900">{selectedHw.title}</h2>
                
                <p className="text-xs text-slate-500 mt-1">
                  Target: {selectedHw.batch}
                </p>

                <div className="mt-4 bg-slate-50 text-slate-800 text-xs p-3 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed shadow-2xs">
                  {selectedHw.description}
                </div>

                {/* ATTACHED WORK SHEETS FROM TEACHER */}
                {selectedHw.attachments && selectedHw.attachments.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-1.5">Worksheets & Materials</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedHw.attachments.map((file, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleDownload(file)}
                          className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-705 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-orange-650 shrink-0"/>
                          <span className="truncate max-w-[150px] font-semibold">{file.name}</span>
                          <Download className="w-3 h-3 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CURRENT SUBMISSION VISUALIZER OR ATTEMPT FORM */}
              {(() => {
                const sub = submissions.find(s => s.homeworkId === selectedHw.id);

                if (sub) {
                  return (
                    <div className="space-y-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                          <h3 className="text-xs font-bold uppercase text-slate-705 flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-emerald-600" /> Your Submission
                          </h3>

                          {sub.status === 'graded' ? (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                              Status: Graded
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                              Review Pending
                            </span>
                          )}
                        </div>

                        {sub.textResponse && (
                          <div className="text-xs text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-wrap">
                            {sub.textResponse}
                          </div>
                        )}

                        {sub.attachments && sub.attachments.length > 0 && (
                          <div className="space-y-1.5 pt-1.5">
                            <h4 className="text-[10px] font-bold uppercase text-slate-500">Submitted Files</h4>
                            <div className="flex flex-wrap gap-2">
                              {sub.attachments.map((file, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleDownload(file)}
                                  className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 text-[10px] px-2 py-1 rounded text-slate-700 transition shadow-2xs"
                                >
                                  <FileText className="w-3 h-3 text-emerald-600" />
                                  <span className="truncate max-w-[120px] font-semibold">{file.name}</span>
                                  <Download className="w-2.5 h-2.5 text-slate-400" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* GRADE REVIEW BOARD */}
                      {sub.status === 'graded' && (
                        <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-xl space-y-2.5">
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-emerald-700 shrink-0" />
                            <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Evaluation and Score</h3>
                          </div>
                          
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-slate-500">Awarded Grade:</span>
                            <span className="text-base font-black text-slate-900 font-mono bg-white px-2.5 py-0.5 rounded border border-slate-200">{sub.grade}</span>
                          </div>

                          {sub.feedback && (
                            <div className="text-xs text-slate-700 pt-1.5 border-t border-slate-150 leading-relaxed">
                              <strong>Teacher Comments:</strong> {sub.feedback}
                            </div>
                          )}
                        </div>
                      )}

                      {/* RESUBMIT CAPABILITY FOR PENDING EVALUATIONS */}
                      {sub.status !== 'graded' && (
                        <div className="text-center">
                          <button
                            onClick={() => {
                              // Enable editing of submission again
                              setTextResponse(sub.textResponse || '');
                              setAttachments(sub.attachments || []);
                              // Temporarily wipe out local submission state to show form
                              setSubmissions(prev => prev.filter(s => s.homeworkId !== selectedHw.id));
                            }}
                            className="text-xs font-bold text-orange-600 hover:text-white uppercase tracking-wider bg-orange-500/5 hover:bg-orange-600 px-3.5 py-2 rounded-xl border border-orange-500/20 transition cursor-pointer"
                          >
                            Edit Submission / Resubmit
                          </button>
                        </div>
                      )}

                    </div>
                  );
                }

                // SUBMIT SOLUTION FORM
                return (
                  <form onSubmit={handleSubmitSolution} className="space-y-4">
                    <h3 className="text-xs font-bold uppercase text-slate-500">Attempt solution</h3>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Your response message / text</label>
                      <textarea
                        value={textResponse}
                        onChange={(e) => setTextResponse(e.target.value)}
                        placeholder="Write your explanation or final responses here..."
                        rows={4}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-orange-500 resize-none font-sans placeholder:text-slate-400"
                      />
                    </div>

                    {/* FILE REGION */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-[10px] font-bold uppercase text-slate-500">Append Files</h4>
                          <p className="text-[11px] text-slate-505">Append PDFs, photos, DOCX or worksheets (limit 800KB).</p>
                        </div>

                        <label className="flex items-center gap-1.5 text-xs text-orange-600 hover:text-white bg-orange-500/5 hover:bg-orange-600 font-bold border border-dashed border-orange-500/20 hover:border-transparent px-2.5 py-1.5 rounded-lg cursor-pointer transition">
                          <Upload className="w-3.5 h-3.5"/> Upload
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
                            <div key={idx} className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs text-slate-700">
                              <span className="truncate pr-2 font-mono flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span className="truncate max-w-[150px]">{file.name}</span>
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
                        <p className="text-[10px] text-slate-500 italic">No files attached to this submit.</p>
                      )}
                    </div>

                    <div className="text-right">
                      <button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition flex items-center gap-2 ml-auto cursor-pointer"
                      >
                        Submit Assignment <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </form>
                );

              })()}

            </div>
          ) : (
            <div className="py-24 text-center text-slate-400 italic text-sm flex flex-col items-center justify-center gap-3">
              <BookOpen className="w-10 h-10 text-slate-300" />
              <span>Select an assignment from the left to view instructions and start your solution attempt.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
