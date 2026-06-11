'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  Bell, 
  Clock, 
  Award, 
  MessageSquare, 
  FileText, 
  Settings, 
  LogOut, 
  Plus, 
  Edit3, 
  Trash2, 
  QrCode, 
  Send, 
  Check, 
  CheckCheck, 
  Search, 
  Sliders, 
  CheckCircle2, 
  CalendarDays, 
  TrendingUp, 
  X,
  Menu,
  UserCheck,
  AlertCircle,
  Shield,
  ShieldAlert,
  HelpCircle,
  FileDown,
  Upload,
  Image as ImageIcon,
  Globe,
  Layers,
  ClipboardList,
  UserCircle,
  Lock
} from 'lucide-react';
import { 
  doc, 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  onSnapshot, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  Academy, 
  Student, 
  AttendanceRecord, 
  Fee, 
  Notice, 
  ClassSchedule, 
  ChatThread, 
  ChatMessage, 
  StudentPortfolio,
  Achievement,
  Certificate,
  GalleryItem,
  ProgressReport,
  compressImage,
  AdmissionRequest,
  PublicInquiry,
  Batch,
  ACADEMY_WORKFLOWS
} from '../types';
import logoImg from '../assets/images/logotech_icon_1780152227001.png';
import CoachingDashboard from '../academy-types/coaching/dashboard';
import DanceDashboard from '../academy-types/dance/dashboard';
import MusicDashboard from '../academy-types/music/dashboard';
import CoachingSidebar from '../academy-types/coaching/sidebar';
import DanceSidebar from '../academy-types/dance/sidebar';
import MusicSidebar from '../academy-types/music/sidebar';
import PublicProfileBuilder from './PublicProfileBuilder';
import TeacherHomeworks from './TeacherHomeworks';
import InstructorsManager from './InstructorsManager';
import SubjectsManager from './SubjectsManager';
import EventsManager from './EventsManager';
import PricingPage from './PricingPage';

interface TeacherDashboardProps {
  academyId: string;
  onLogout: () => void;
}

export default function TeacherDashboard({ academyId, onLogout }: TeacherDashboardProps) {
  const [activeTab, setActiveTab ] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [academy, setAcademy] = useState<Academy | null>(null);

  // Razorpay subscription specific states
  const [isCheckoutLoading, setIsCheckoutLoading] = useState<boolean>(false);
  const [isCancelLoading, setIsCancelLoading] = useState<boolean>(false);
  const [subDetails, setSubDetails] = useState<any>(null);
  
  // Need hooks here ...
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [admissionRequests, setAdmissionRequests] = useState<AdmissionRequest[]>([]);
  const [inquiries, setInquiries] = useState<PublicInquiry[]>([]);

  const workflow = (academy && ACADEMY_WORKFLOWS[academy.academyType]) ? ACADEMY_WORKFLOWS[academy.academyType] : ACADEMY_WORKFLOWS['Coaching / Tuition'];

  // Firestore real-time values
  const [notices, setNotices] = useState<Notice[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);

  // Selected sub-states
  const [selectedStudentChatId, setSelectedStudentChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatSearch, setChatSearch] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatImageBase64, setChatImageBase64] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);
  const chatFileRef = useRef<HTMLInputElement>(null);

  // Form states and dialog flags
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentPhoto, setStudentPhoto] = useState('');
  const [studentParentName, setStudentParentName] = useState('');
  const [studentParentPhone, setStudentParentPhone] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentBatch, setStudentBatch] = useState('Batch Alpha');
  const [studentNotes, setStudentNotes] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentDisabled, setStudentDisabled] = useState(false);
  const [studentAcademicLevel, setStudentAcademicLevel] = useState('');
  const [studentSkillLevel, setStudentSkillLevel] = useState('');
  const [studentDanceStyle, setStudentDanceStyle] = useState('');
  const [studentInstrumentCategory, setStudentInstrumentCategory] = useState('');

  // Batch Manager form states
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [batchName, setBatchName] = useState('');
  const [batchDescription, setBatchDescription] = useState('');
  const [showBatchAssignModal, setShowBatchAssignModal] = useState<Batch | null>(null);
  const [assignStudentIds, setAssignStudentIds] = useState<string[]>([]);

  // Attendance tracker form state
  const [attendanceBatch, setAttendanceBatch] = useState('Batch Alpha');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<{ [studentId: string]: 'present' | 'absent' | 'late' }>({});

  // Fees Creator form state
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [feeStudentId, setFeeStudentId] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [feeDueDate, setFeeDueDate] = useState('');

  // Notice Creator states
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticePinned, setNoticePinned] = useState(false);

  // Class Scheduler states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schBatchName, setSchBatchName] = useState('Batch Alpha');
  const [schClassName, setSchClassName] = useState('');
  const [schDayOfWeek, setSchDayOfWeek] = useState('Monday');
  const [schStartTime, setSchStartTime] = useState('09:00');
  const [schEndTime, setSchEndTime] = useState('10:00');
  const [schTeacherName, setSchTeacherName] = useState('');

  // Portfolio modifier states
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [portfolioData, setPortfolioData] = useState<StudentPortfolio | null>(null);
  const [newAchievementTitle, setNewAchievementTitle] = useState('');
  const [newAchievementDesc, setNewAchievementDesc] = useState('');
  const [newCertTitle, setNewCertTitle] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertUrl, setNewCertUrl] = useState('');
  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [gradeSubject, setGradeSubject] = useState('');
  const [gradeScore, setGradeScore] = useState('');
  const [gradeValue, setGradeValue] = useState('A');
  const [gradeComments, setGradeComments] = useState('');
  const [portfolioFeedback, setPortfolioFeedback] = useState('');
  const [portfolioVisible, setPortfolioVisible] = useState(true);

  // Settings updating states
  const [setInstName, setSetInstName] = useState('');
  const [setInstLogo, setSetInstLogo] = useState('');
  const [setInstEmail, setSetInstEmail] = useState('');
  const [setInstPhone, setSetInstPhone] = useState('');
  const [setInstAddress, setSetInstAddress] = useState('');
  const [setInstUpi, setSetInstUpi] = useState('');
  const [setInstQr, setSetInstQr] = useState('');
  const [setInstPayment, setSetInstPayment] = useState('');

  const settingLogoRef = useRef<HTMLInputElement>(null);
  const settingQrRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Subscription details from Firestore
  useEffect(() => {
    if (!academyId) return;
    const loadSubDetails = async () => {
      try {
        const q = query(collection(db, 'subscriptions'), where('academyId', '==', academyId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const subsList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setSubDetails(subsList[0]);
        } else {
          setSubDetails(null);
        }
      } catch (e) {
        console.error('Error fetching subscription data:', e);
      }
    };
    
    if (activeTab === 'billing') {
      loadSubDetails();
    }
  }, [academyId, activeTab, academy?.subscriptionStatus]);

  // 2. Start Razorpay checkout flow
  const handleInitiateSubscriptionCheckout = async () => {
    if (!(window as any).Razorpay) {
      alert('Razorpay Checkout SDK is still loading. Please click again in a few seconds.');
      return;
    }

    try {
      setIsCheckoutLoading(true);
      const createRes = await fetch('/api/razorpay/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          academyId,
          academyName: academy?.institutionName || 'Academy'
        })
      });

      const session = await createRes.json();
      if (!createRes.ok || session.error) {
        throw new Error(session.error || 'Failed to create subscription session.');
      }

      const options = {
        key: session.keyId,
        subscription_id: session.subscriptionId,
        name: "Flodech Pro",
        description: "Unlimited administrative access for Flodech Pro",
        image: logoImg,
        handler: async function (response: any) {
          try {
            setIsCheckoutLoading(true);
            const verifyRes = await fetch('/api/razorpay/verify-subscription', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
                academyId,
                academyName: academy?.institutionName || 'Academy'
              })
            });

            const verifyResult = await verifyRes.json();
            if (verifyResult.success) {
              setAcademy((prev: any) => {
                if (!prev) return null;
                return { ...prev, subscriptionStatus: 'active' };
              });
              setActiveTab('dashboard');
              alert('Congratulations! Your Flodech Pro premium access is active.');
            } else {
              alert('Payment verification failed: ' + verifyResult.error);
            }
          } catch (err: any) {
            console.error('Verify error:', err);
            alert('Verification contact failed: ' + err.message);
          } finally {
            setIsCheckoutLoading(false);
          }
        },
        prefill: {
          name: academy?.institutionName || "Director",
          email: academy?.academyEmail || ""
        },
        theme: {
          color: "#f97316"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error('Checkout creation error:', err);
      alert('Subscription startup error: ' + err.message);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // 3. Subscription cancellation
  const handleCancelSubscription = async () => {
    const targetSubId = subDetails?.razorpaySubscriptionId || subDetails?.id;
    if (!targetSubId) {
      alert('No active Razorpay subscription session found.');
      return;
    }

    if (!confirm('Are you absolutely sure you want to cancel your Flodech Pro subscription? Your administrative access will end immediately.')) {
      return;
    }

    try {
      setIsCancelLoading(true);
      const cancelRes = await fetch('/api/razorpay/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscriptionId: targetSubId,
          academyId
        })
      });

      const cancelResult = await cancelRes.json();
      if (cancelResult.success) {
        setAcademy((prev: any) => {
          if (!prev) return null;
          return { ...prev, subscriptionStatus: 'cancelled' };
        });
        alert('Your Flodech subscription has been successfully cancelled.');
      } else {
        alert('Cancellation request failed: ' + cancelResult.error);
      }
    } catch (err: any) {
      console.error('Cancel request error:', err);
      alert('Error contact cancellation endpoint: ' + err.message);
    } finally {
      setIsCancelLoading(false);
    }
  };

  // Load Academy details
  useEffect(() => {
    async function loadAcademy() {
      try {
        setLoading(true);
        const aDocRef = doc(db, 'academies', academyId);
        const aSnap = await getDoc(aDocRef);
        if (aSnap.exists()) {
          const aData = aSnap.data() as Academy;
          setAcademy(aData);
          setSetInstName(aData.institutionName);
          setSetInstLogo(aData.logoUrl);
          setSetInstEmail(aData.academyEmail);
          setSetInstPhone(aData.phone);
          setSetInstAddress(aData.address);
          setSetInstUpi(aData.upiId);
          setSetInstQr(aData.upiQrCode);
          setSetInstPayment(aData.paymentInstructions);
        }
      } catch (err) {
        console.error('Error fetching academy:', err);
      } finally {
        setLoading(false);
      }
    }
    if (academyId) {
      loadAcademy();
    }
  }, [academyId]);

  // Read-modify-write real-time subscribers for Academy dependencies
  useEffect(() => {
    if (!academyId) return;

    // 1. Students Subscriber
    const studentsQuery = query(
      collection(db, 'students'),
      where('academyId', '==', academyId)
    );
    const unsubsStudents = onSnapshot(studentsQuery, (snap) => {
      const stdList: Student[] = [];
      snap.forEach((d) => {
        stdList.push({ id: d.id, ...d.data() } as Student);
      });
      setStudents(stdList);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'students');
    });

    // 2. Notices Subscriber
    const noticesQuery = query(
      collection(db, 'notices'),
      where('academyId', '==', academyId)
    );
    const unsubsNotices = onSnapshot(noticesQuery, (snap) => {
      const noticeList: Notice[] = [];
      snap.forEach((d) => {
        noticeList.push({ id: d.id, ...d.data() } as Notice);
      });
      noticeList.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      });
      setNotices(noticeList);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'notices');
    });

    // 3. Timetable Schedules Subscriber
    const schedulesQuery = query(
      collection(db, 'schedules'),
      where('academyId', '==', academyId)
    );
    const unsubsSchedules = onSnapshot(schedulesQuery, (snap) => {
      const schList: ClassSchedule[] = [];
      snap.forEach((d) => {
        schList.push({ id: d.id, ...d.data() } as ClassSchedule);
      });
      setSchedules(schList);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'schedules');
    });

    // 4. Fees Invoices Subscriber
    const feesQuery = query(
      collection(db, 'fees'),
      where('academyId', '==', academyId)
    );
    const unsubsFees = onSnapshot(feesQuery, (snap) => {
      const feeList: Fee[] = [];
      snap.forEach((d) => {
        feeList.push({ id: d.id, ...d.data() } as Fee);
      });
      setFees(feeList);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'fees');
    });

    // 5. Attendance Subscriber
    const attendanceQuery = query(
      collection(db, 'attendance'),
      where('academyId', '==', academyId)
    );
    const unsubsAttendance = onSnapshot(attendanceQuery, (snap) => {
      const attList: AttendanceRecord[] = [];
      snap.forEach((d) => {
        attList.push({ id: d.id, ...d.data() } as AttendanceRecord);
      });
      setAttendance(attList);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'attendance');
    });

    // 6. Chats Thread Subscriber
    const chatsQuery = query(
      collection(db, 'chats'),
      where('academyId', '==', academyId)
    );
    const unsubsChats = onSnapshot(chatsQuery, (snap) => {
      const chatList: ChatThread[] = [];
      snap.forEach((d) => {
        chatList.push({ id: d.id, ...d.data() } as ChatThread);
      });
      chatList.sort((a, b) => {
        const aTime = a.lastMessageAt?.seconds || 0;
        const bTime = b.lastMessageAt?.seconds || 0;
        return bTime - aTime;
      });
      setChatThreads(chatList);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'chats');
    });

    // 7. Admissions Subscriber
    const admissionsQuery = query(
      collection(db, 'admissions'),
      where('academyId', '==', academyId)
    );
    const unsubsAdmissions = onSnapshot(admissionsQuery, (snap) => {
      const list: AdmissionRequest[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as AdmissionRequest);
      });
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setAdmissionRequests(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'admissions');
    });

    // 8. Inquiries Subscriber
    const inquiriesQuery = query(
      collection(db, 'inquiries'),
      where('academyId', '==', academyId)
    );
    const unsubsInquiries = onSnapshot(inquiriesQuery, (snap) => {
      const list: PublicInquiry[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as PublicInquiry);
      });
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setInquiries(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'inquiries');
    });

    // 9. Batches Subscriber
    const batchesQuery = query(
      collection(db, 'batches'),
      where('academyId', '==', academyId)
    );
    const unsubsBatches = onSnapshot(batchesQuery, (snap) => {
      const bList: Batch[] = [];
      snap.forEach((d) => {
        bList.push({ id: d.id, ...d.data() } as Batch);
      });
      bList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setBatches(bList);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'batches');
    });

    return () => {
      unsubsStudents();
      unsubsNotices();
      unsubsSchedules();
      unsubsFees();
      unsubsAttendance();
      unsubsChats();
      unsubsAdmissions();
      unsubsInquiries();
      unsubsBatches();
    };
  }, [academyId]);

  // Synchronize initial selections to the first custom batch if available
  useEffect(() => {
    if (batches.length > 0) {
      if (studentBatch === 'Batch Alpha') setStudentBatch(batches[0].name);
      if (attendanceBatch === 'Batch Alpha') setAttendanceBatch(batches[0].name);
      if (schBatchName === 'Batch Alpha') setSchBatchName(batches[0].name);
    }
  }, [batches]);

  // Chat individual stream load
  useEffect(() => {
    if (!selectedStudentChatId) return;

    // Reset unread counts on select
    const resetUnreads = async () => {
      try {
        await updateDoc(doc(db, 'chats', selectedStudentChatId), {
          unreadCountTeacher: 0
        });
      } catch (e) {
        console.error('Error clearing read receipts:', e);
      }
    };
    resetUnreads();

    const messagesQuery = query(
      collection(db, 'chats', selectedStudentChatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubsMessages = onSnapshot(messagesQuery, (snap) => {
      const messagesList: ChatMessage[] = [];
      snap.forEach((d) => {
        messagesList.push({ id: d.id, ...d.data() } as ChatMessage);
        // Sync read receipt on incoming
        if (d.data().senderRole === 'student' && !d.data().read) {
          updateDoc(doc(db, 'chats', selectedStudentChatId, 'messages', d.id), { read: true });
        }
      });
      setChatMessages(messagesList);
      scrollToBottom();
    });

    return () => {
      unsubsMessages();
    };
  }, [selectedStudentChatId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Generate unique Student ID
  const generateStudentID = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'FLD-STU-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Save student registration
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentParentName.trim() || !studentParentPhone.trim() || !studentEmail.trim()) {
      alert('Please fill in Name, Parent details, and Email address.');
      return;
    }

    try {
      let uniqueId = editingStudent ? editingStudent.id : '';
      if (!editingStudent) {
        let isUnique = false;
        while (!isUnique) {
          uniqueId = generateStudentID();
          const checkSnap = await getDoc(doc(db, 'students', uniqueId));
          if (!checkSnap.exists()) {
            isUnique = true;
          }
        }
      }

      const defaultPin = Math.floor(100000 + Math.random() * 900000).toString();
      const generatedPassword = studentPassword.trim() || defaultPin;

      const stdObject: Student = {
        id: uniqueId,
        academyId,
        name: studentName.trim(),
        profilePhoto: studentPhoto || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(studentName),
        parentName: studentParentName.trim(),
        parentPhone: studentParentPhone.trim(),
        email: studentEmail.trim().toLowerCase(),
        batch: studentBatch,
        notes: studentNotes.trim(),
        password: generatedPassword,
        disabled: studentDisabled,
        createdAt: editingStudent?.createdAt || new Date(),
        academicLevel: studentAcademicLevel.trim(),
        skillLevel: studentSkillLevel.trim(),
        danceStyle: studentDanceStyle.trim(),
        instrumentCategory: studentInstrumentCategory.trim()
      };

      // 1. Create/Update student record
      await setDoc(doc(db, 'students', uniqueId), stdObject);

      // 2. Initialize default chat index automatically
      await setDoc(doc(db, 'chats', uniqueId), {
        id: uniqueId,
        academyId,
        studentId: uniqueId,
        studentName: studentName.trim(),
        lastMessage: 'Chat channel initiated with academy.',
        lastMessageAt: new Date(),
        unreadCountTeacher: 0,
        unreadCountStudent: 0
      }, { merge: true });

      // 3. Initialize student portfolio if doesn't exist
      const pDocRef = doc(db, 'portfolios', uniqueId);
      const pDoc = await getDoc(pDocRef);
      if (!pDoc.exists()) {
        await setDoc(pDocRef, {
          id: uniqueId,
          academyId,
          isVisible: true,
          achievements: [],
          certificates: [],
          gallery: [],
          progressReports: [],
          teacherFeedback: 'Welcome to your digital academy portfolio! Track and showcase achievements here.',
          updatedAt: new Date()
        });
      }

      setShowStudentModal(false);
      resetStudentForm();
    } catch (err) {
      alert('An error occurred while saving the student details.');
      console.error(err);
    }
  };

  const handleEditStudent = (s: Student) => {
    setEditingStudent(s);
    setStudentName(s.name);
    setStudentPhoto(s.profilePhoto);
    setStudentParentName(s.parentName);
    setStudentParentPhone(s.parentPhone);
    setStudentEmail(s.email);
    setStudentBatch(s.batch);
    setStudentNotes(s.notes);
    setStudentPassword(s.password);
    setStudentDisabled(s.disabled);
    setStudentAcademicLevel(s.academicLevel || '');
    setStudentSkillLevel(s.skillLevel || '');
    setStudentDanceStyle(s.danceStyle || '');
    setStudentInstrumentCategory(s.instrumentCategory || '');
    setShowStudentModal(true);
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this student and all associated records?')) return;
    try {
      await deleteDoc(doc(db, 'students', studentId));
      await deleteDoc(doc(db, 'chats', studentId));
      await deleteDoc(doc(db, 'portfolios', studentId));
    } catch (err) {
      console.error('Error deleting student:', err);
    }
  };

  const resetStudentForm = () => {
    setEditingStudent(null);
    setStudentName('');
    setStudentPhoto('');
    setStudentParentName('');
    setStudentParentPhone('');
    setStudentEmail('');
    setStudentBatch(batches.length > 0 ? batches[0].name : 'Batch Alpha');
    setStudentNotes('');
    setStudentPassword('');
    setStudentDisabled(false);
    setStudentAcademicLevel('');
    setStudentSkillLevel('');
    setStudentDanceStyle('');
    setStudentInstrumentCategory('');
  };

  // Batch manager actions
  const generateBatchID = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'FLD-BAT-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName.trim()) {
      alert('Please fill in Batch Name.');
      return;
    }

    try {
      const uniqueId = editingBatch ? editingBatch.id : generateBatchID();
      const batchObj: Batch = {
        id: uniqueId,
        academyId,
        name: batchName.trim(),
        description: batchDescription.trim(),
        createdAt: editingBatch?.createdAt || new Date()
      };

      await setDoc(doc(db, 'batches', uniqueId), batchObj);
      setShowBatchModal(false);
      setBatchName('');
      setBatchDescription('');
      setEditingBatch(null);
    } catch (err) {
      console.error('Error saving batch:', err);
      alert('An error occurred while saving the batch.');
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (!window.confirm('Are you sure you want to delete this batch? Registered students will remain but their batch name may need to be updated.')) return;
    try {
      await deleteDoc(doc(db, 'batches', batchId));
    } catch (err) {
      console.error('Error deleting batch:', err);
      alert('An error occurred while deleting the batch.');
    }
  };

  const handleUpdateBatchAssignments = async (batch: Batch, selectedStudentIds: string[]) => {
    try {
      for (const std of students) {
        const isSelected = selectedStudentIds.includes(std.id);
        const currentBatches = std.batch 
          ? std.batch.split(',').map(b => b.trim()).filter(Boolean) 
          : [];
        const isCurrentlyInBatch = currentBatches.includes(batch.name);
        
        if (isSelected && !isCurrentlyInBatch) {
          const newBatches = [...currentBatches, batch.name];
          await updateDoc(doc(db, 'students', std.id), { batch: newBatches.join(', ') });
        } else if (!isSelected && isCurrentlyInBatch) {
          const newBatches = currentBatches.filter(b => b !== batch.name);
          await updateDoc(doc(db, 'students', std.id), { batch: newBatches.join(', ') });
        }
      }
      setShowBatchAssignModal(null);
    } catch (err) {
      console.error('Error updating batch assignments:', err);
      alert('An error occurred while updating student assignments.');
    }
  };

  // Convert File to Base64 with canvas-based compression to stay under Firestore document size limits
  const attachBase64Image = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, 400, 0.7)
        .then((compressedBase64) => {
          setter(compressedBase64);
        })
        .catch((err) => {
          console.error("Image compression error, using fallback direct reader:", err);
          const reader = new FileReader();
          reader.onloadend = () => {
            setter(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
    }
  };

  // Mark Attendance batch-wide
  const handleMarkAttendance = async () => {
    try {
      const attendanceId = `${academyId}_${attendanceBatch}_${attendanceDate}`;
      
      const payload: AttendanceRecord = {
        id: attendanceId,
        academyId,
        batch: attendanceBatch,
        date: attendanceDate,
        records: attendanceRecords,
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'attendance', attendanceId), payload);
      alert('Attendance logs synced and deployed!');
    } catch (err) {
      console.error('Error deploying attendance:', err);
    }
  };

  const handleStudentAttendanceBoxChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Create Fee invoice
  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeStudentId || !feeAmount || !feeDueDate) {
      alert('Please fill in Student choice, invoice Amount and Due Date.');
      return;
    }

    try {
      const targetStudent = students.find(s => s.id === feeStudentId);
      if (!targetStudent) return;

      const feeId = 'FEE-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const payload: Fee = {
        id: feeId,
        academyId,
        studentId: feeStudentId,
        studentName: targetStudent.name,
        amount: parseFloat(feeAmount),
        dueDate: feeDueDate,
        status: 'pending',
        createdAt: new Date()
      };

      await setDoc(doc(db, 'fees', feeId), payload);
      setShowFeeModal(false);
      setFeeStudentId('');
      setFeeAmount('');
      setFeeDueDate('');
    } catch (err) {
      console.error('Error logging fee dues:', err);
    }
  };

  // Toggle invoice pay status
  const handleToggleFeeStatus = async (fee: Fee) => {
    try {
      const newStatus = fee.status === 'pending' ? 'paid' : 'pending';
      const updates: Partial<Fee> = {
        status: newStatus,
        paidDate: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : '',
        receiptNumber: newStatus === 'paid' ? 'REC-' + Math.floor(100000 + Math.random() * 900000) : ''
      };

      await updateDoc(doc(db, 'fees', fee.id), updates);
    } catch (err) {
      console.error('Error updating fee status:', err);
    }
  };

  // Create notice announcement
  const handleDeployNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      alert('Fill in notice title and body content.');
      return;
    }

    try {
      const noticeId = 'NTC-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const payload: Notice = {
        id: noticeId,
        academyId,
        title: noticeTitle.trim(),
        content: noticeContent.trim(),
        isPinned: noticePinned,
        createdAt: new Date()
      };

      await setDoc(doc(db, 'notices', noticeId), payload);
      setShowNoticeModal(false);
      setNoticeTitle('');
      setNoticeContent('');
      setNoticePinned(false);
    } catch (err) {
      console.error('Error creating notice:', err);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm('Delete this announcement notice?')) return;
    try {
      await deleteDoc(doc(db, 'notices', id));
    } catch (err) {
      console.error('Notice deletion error:', err);
    }
  };

  // Deploy schedules calendar
  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schClassName.trim() || !schStartTime || !schEndTime || !schTeacherName.trim()) {
      alert('Please fill in Class name, Timings, and Director name.');
      return;
    }

    try {
      const schId = 'SCH-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const payload: ClassSchedule = {
        id: schId,
        academyId,
        batchName: schBatchName,
        className: schClassName.trim(),
        dayOfWeek: schDayOfWeek,
        startTime: schStartTime,
        endTime: schEndTime,
        teacherName: schTeacherName.trim()
      };

      await setDoc(doc(db, 'schedules', schId), payload);
      setShowScheduleModal(false);
      setSchClassName('');
      setSchTeacherName('');
    } catch (err) {
      console.error('Error creating schedule timetable:', err);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm('Remove this class block from weekly calendars?')) return;
    try {
      await deleteDoc(doc(db, 'schedules', id));
    } catch (err) {
      console.error(err);
    }
  };

  // Load selected Portfolio data
  const handleSelectPortfolioStudent = async (studentId: string) => {
    setSelectedPortfolioId(studentId);
    try {
      const pRef = doc(db, 'portfolios', studentId);
      const pSnap = await getDoc(pRef);
      if (pSnap.exists()) {
        const pData = pSnap.data() as StudentPortfolio;
        setPortfolioData(pData);
        setPortfolioFeedback(pData.teacherFeedback || '');
        setPortfolioVisible(pData.isVisible);
      }
    } catch (err) {
      console.error('Error loading portfolio:', err);
    }
  };

  const handleUpdatePortfolioMetadata = async () => {
    if (!selectedPortfolioId || !portfolioData) return;
    try {
      await updateDoc(doc(db, 'portfolios', selectedPortfolioId), {
        teacherFeedback: portfolioFeedback,
        isVisible: portfolioVisible,
        updatedAt: new Date()
      });
      alert('Portfolio visibility & notes synchronized!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAchievement = async () => {
    if (!selectedPortfolioId || !portfolioData || !newAchievementTitle.trim()) return;
    try {
      const newItem: Achievement = {
        title: newAchievementTitle.trim(),
        date: new Date().toISOString().split('T')[0],
        desc: newAchievementDesc.trim()
      };
      const updatedList = [...(portfolioData.achievements || []), newItem];
      await updateDoc(doc(db, 'portfolios', selectedPortfolioId), {
        achievements: updatedList,
        updatedAt: new Date()
      });
      setPortfolioData(prev => prev ? ({ ...prev, achievements: updatedList }) : null);
      setNewAchievementTitle('');
      setNewAchievementDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCertificate = async () => {
    if (!selectedPortfolioId || !portfolioData || !newCertTitle.trim() || !newCertIssuer.trim()) return;
    try {
      const newItem: Certificate = {
        title: newCertTitle.trim(),
        issuer: newCertIssuer.trim(),
        date: new Date().toISOString().split('T')[0],
        fileUrl: newCertUrl || 'https://images.unsplash.com/photo-1589330694653-ded6df53f6ee?auto=format&fit=crop&q=80&w=200'
      };
      const updatedList = [...(portfolioData.certificates || []), newItem];
      await updateDoc(doc(db, 'portfolios', selectedPortfolioId), {
        certificates: updatedList,
        updatedAt: new Date()
      });
      setPortfolioData(prev => prev ? ({ ...prev, certificates: updatedList }) : null);
      setNewCertTitle('');
      setNewCertIssuer('');
      setNewCertUrl('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddGalleryItem = async () => {
    if (!selectedPortfolioId || !portfolioData || !newGalleryTitle.trim()) return;
    try {
      const newItem: GalleryItem = {
        title: newGalleryTitle.trim(),
        imageUrl: newGalleryUrl || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400'
      };
      const updatedList = [...(portfolioData.gallery || []), newItem];
      await updateDoc(doc(db, 'portfolios', selectedPortfolioId), {
        gallery: updatedList,
        updatedAt: new Date()
      });
      setPortfolioData(prev => prev ? ({ ...prev, gallery: updatedList }) : null);
      setNewGalleryTitle('');
      setNewGalleryUrl('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddGradeReport = async () => {
    if (!selectedPortfolioId || !portfolioData || !gradeSubject.trim() || !gradeScore.trim()) return;
    try {
      const newItem: ProgressReport = {
        subject: gradeSubject.trim(),
        score: gradeScore.trim(),
        grade: gradeValue,
        comments: gradeComments.trim(),
        date: new Date().toISOString().split('T')[0]
      };
      const updatedList = [...(portfolioData.progressReports || []), newItem];
      await updateDoc(doc(db, 'portfolios', selectedPortfolioId), {
        progressReports: updatedList,
        updatedAt: new Date()
      });
      setPortfolioData(prev => prev ? ({ ...prev, progressReports: updatedList }) : null);
      setGradeSubject('');
      setGradeScore('');
      setGradeComments('');
    } catch (err) {
      console.error(err);
    }
  };

  // Chats outgoing channel message handler
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentChatId) return;
    if (!chatInput.trim() && !chatImageBase64) return;

    try {
      const msgId = 'MSG-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const messagePayload: ChatMessage = {
        id: msgId,
        senderId: academyId, // sender is academy admin
        senderRole: 'teacher',
        content: chatInput.trim() || 'Shared an image',
        imageUrl: chatImageBase64 || '',
        createdAt: new Date(),
        read: false
      };

      // 1. Post Chat Message
      await setDoc(doc(db, 'chats', selectedStudentChatId, 'messages', msgId), messagePayload);

      // 2. Refresh Chat thread parent doc
      const threadRef = doc(db, 'chats', selectedStudentChatId);
      await updateDoc(threadRef, {
        lastMessage: chatInput.trim() || 'Shared an image',
        lastMessageAt: new Date(),
        unreadCountStudent: 1, // student receives notification
        unreadCountTeacher: 0
      });

      setChatInput('');
      setChatImageBase64('');
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  // Deploy Academy changes
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updates: Partial<Academy> = {
        institutionName: setInstName.trim(),
        logoUrl: setInstLogo,
        academyEmail: setInstEmail.trim(),
        phone: setInstPhone.trim(),
        address: setInstAddress.trim(),
        upiId: setInstUpi.trim(),
        upiQrCode: setInstQr,
        paymentInstructions: setInstPayment.trim()
      };

      await updateDoc(doc(db, 'academies', academyId), updates);
      alert('Academy metadata updated successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  // Calculation parameters for dashboard totals
  const getAcademySumPendingFees = (): number => {
    return fees
      .filter(f => f.status === 'pending')
      .reduce((sum, f) => sum + f.amount, 0);
  };

  const getAttendanceSummaryPercentage = (): number => {
    if (attendance.length === 0 || students.length === 0) return 92;
    let presentCount = 0;
    let totalPossibles = 0;

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
    return Math.round((presentCount / totalPossibles) * 105) > 100 ? 100 : Math.round((presentCount / totalPossibles) * 100);
  };

  const getRecentNotices = () => notices.slice(0, 3);
  const getUpcomingClasses = () => schedules.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-850 selection:bg-orange-500 selection:text-white">
      
      {/* MODULAR ACADEMY-SPECIFIC SIDEBARS */}
      {(() => {
        if (!academy) return (
          <aside className="w-full md:w-64 bg-slate-950 text-white flex flex-col shrink-0 p-6">
            <span className="text-sm text-slate-500 font-semibold animate-pulse">Initializing direct links...</span>
          </aside>
        );
        switch (academy.academyType) {
          case 'Dance Academy':
            return (
              <DanceSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                academy={academy}
                onLogout={onLogout}
                logoImg={logoImg}
                setInstLogo={setInstLogo}
              />
            );
          case 'Music Academy':
            return (
              <MusicSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                academy={academy}
                onLogout={onLogout}
                logoImg={logoImg}
                setInstLogo={setInstLogo}
              />
            );
          default:
            return (
              <CoachingSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                academy={academy}
                onLogout={onLogout}
                logoImg={logoImg}
                setInstLogo={setInstLogo}
              />
            );
        }
      })()}

      {/* CORE CONTENT WORKSPACE */}
      <main className="flex-grow p-6 sm:p-10 overflow-y-auto max-w-5xl mx-auto w-full">
        
        {/* TOP PANEL SECTION */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest text-orange-500 uppercase">Academy Director Portal</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5 capitalize">{activeTab} panel</h1>
          </div>
        </header>

        {/* SUBSCRIPTION GUARD */}
        {academy && academy.subscriptionStatus !== 'active' && activeTab !== 'billing' && (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-rose-100 shadow-sm max-w-2xl mx-auto my-10">
            <Lock className="w-16 h-16 text-rose-500 mb-6" />
            <h2 className="text-2xl font-black text-slate-900 mb-3">Subscription Expired or Required</h2>
            <p className="text-sm text-slate-600 mb-8 max-w-sm">
              Your Flodech Pro subscription is currently {academy.subscriptionStatus || 'inactive'}. Please renew your plan to unlock full dashboard access.
            </p>
            <button
              onClick={() => setActiveTab('billing')}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-md cursor-pointer"
            >
              Manage Subscription
            </button>
          </div>
        )}

        {/* ======================================= */}
        {/* BILLING MODULE */}
        {activeTab === 'billing' && academy && (
          <div className="space-y-8">
            {subDetails || academy.subscriptionStatus === 'active' ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-100">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-emerald-500" /> Subscription Details
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Manage your active Flodech Pro plan</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${academy.subscriptionStatus === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                      STATUS: {academy.subscriptionStatus || 'UNKNOWN'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Plan</p>
                    <p className="font-bold text-slate-900 text-lg">Flodech Pro - ₹499/mo</p>
                  </div>
                  {subDetails?.nextBillingDate && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Next Billing Date</p>
                      <p className="font-bold text-slate-900 text-lg">
                        {new Date((subDetails?.nextBillingDate?.seconds || 0) * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {subDetails?.razorpaySubscriptionId && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Razorpay Subscription ID</p>
                      <p className="font-mono text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 inline-block">
                        {subDetails.razorpaySubscriptionId}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {academy.subscriptionStatus === 'active' ? (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={isCancelLoading}
                      className="px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold uppercase tracking-wider text-xs border border-rose-200 cursor-pointer disabled:opacity-50"
                    >
                      {isCancelLoading ? 'Cancelling...' : 'Cancel Subscription'}
                    </button>
                  ) : (
                    <button
                      onClick={handleInitiateSubscriptionCheckout}
                      disabled={isCheckoutLoading}
                      className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isCheckoutLoading ? 'Opening...' : 'Renew Subscription'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <PricingPage 
                onSubscribe={handleInitiateSubscriptionCheckout} 
                isLoading={isCheckoutLoading} 
                isDashboardView={true}
                academyName={academy.institutionName}
              />
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* 1. DASHBOARD OVERVIEW */}
        {(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'dashboard' && (
          (() => {
            if (!academy) return null;
            switch (academy.academyType) {
              case 'Dance Academy':
                return (
                  <DanceDashboard
                    academy={academy}
                    students={students}
                    batches={batches}
                    schedules={schedules}
                    notices={notices}
                    fees={fees}
                    attendance={attendance}
                  />
                );
              case 'Music Academy':
                return (
                  <MusicDashboard
                    academy={academy}
                    students={students}
                    batches={batches}
                    schedules={schedules}
                    notices={notices}
                    fees={fees}
                    attendance={attendance}
                  />
                );
              default:
                return (
                  <CoachingDashboard
                    academy={academy}
                    students={students}
                    batches={batches}
                    schedules={schedules}
                    notices={notices}
                    fees={fees}
                    attendance={attendance}
                  />
                );
            }
          })()
        )}

        {/* ======================================= */}
        {/* 2. STUDENTS DIRECTORY */}
        {(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-baseline sm:items-center gap-4">
              <h3 className="font-bold text-slate-900 uppercase">Student Registration dossier</h3>
              
              <button
                id="add-student-trigger-btn"
                onClick={() => {
                  resetStudentForm();
                  setShowStudentModal(true);
                }}
                className="px-4 py-2.5 bg-orange-500 font-bold text-xs uppercase tracking-wider text-white hover:bg-orange-600 transition-colors rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm shadow-orange-500/10"
              >
                <Plus className="w-4 h-4" /> Enroll Student
              </button>
            </div>

            {/* Grid list of students */}
            {students.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {students.map((std) => (
                  <div 
                    key={std.id} 
                    className="bg-white p-6 border border-slate-200/60 rounded-3xl shadow-sm flex items-center justify-between gap-4 hover:border-orange-200 transition-colors relative"
                  >
                    <div className="flex items-center gap-4">
                      <img 
                        src={std.profilePhoto} 
                        alt={std.name} 
                        className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-200 p-0.5 shrink-0" 
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 leading-snug">{std.name}</h4>
                          {std.disabled && (
                            <span className="px-1.5 py-0.2 bg-red-50 border border-red-100 rounded text-[8px] font-bold text-red-600 font-mono">
                              DISABLED
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold font-mono">{std.id}</span>
                        <div className="text-xs text-slate-400 font-semibold mt-1 flex items-center gap-2">
                          <span>{std.batch}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>Pass: <code className="bg-slate-50 px-1 rounded text-slate-600 font-mono text-[10px]">{std.password}</code></span>
                        </div>

                        {/* Dynamic contextual categorization indicators */}
                        {academy?.academyType === 'Coaching / Tuition' && std.academicLevel && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-md text-indigo-600 font-mono">
                              Level: {std.academicLevel}
                            </span>
                          </div>
                        )}
                        {academy?.academyType === 'Dance Academy' && (std.danceStyle || std.skillLevel) && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {std.danceStyle && (
                              <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-rose-50 border border-rose-100 rounded-md text-rose-600 font-mono">
                                Style: {std.danceStyle}
                              </span>
                            )}
                            {std.skillLevel && (
                              <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-md text-emerald-600 font-mono">
                                Rank: {std.skillLevel}
                              </span>
                            )}
                          </div>
                        )}
                        {academy?.academyType === 'Music Academy' && (std.instrumentCategory || std.skillLevel) && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {std.instrumentCategory && (
                              <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-cyan-50 border border-cyan-100 rounded-md text-cyan-600 font-mono">
                                Instrument: {std.instrumentCategory}
                              </span>
                            )}
                            {std.skillLevel && (
                              <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-amber-50 border border-amber-100 rounded-md text-amber-600 font-mono">
                                Level: {std.skillLevel}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditStudent(std)}
                        className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-55 rounded-lg shrink-0 cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(std.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0 cursor-pointer"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">Your directory is empty</h3>
                <p className="text-slate-400 text-xs mt-1">Enroll your first student using the CTA above.</p>
              </div>
            )}

            {/* Modal Enrollment View */}
            {showStudentModal && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border rounded-3xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col justify-between">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <h3 className="text-base font-black text-slate-950 uppercase">{editingStudent ? 'Edit Student Details' : 'Enroll New Student'}</h3>
                    <button onClick={() => setShowStudentModal(false)} className="text-slate-400 hover:text-slate-800 cursor-pointer"><X className="w-5 h-5" /></button>
                  </div>

                  <form onSubmit={handleSaveStudent} className="p-6 space-y-4 overflow-y-auto flex-grow">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Student Full Name *</label>
                        <input
                          id="form-std-name"
                          type="text"
                          required
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Student Email *</label>
                        <input
                          id="form-std-email"
                          type="email"
                          required
                          value={studentEmail}
                          onChange={(e) => setStudentEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Parent Guardian Name *</label>
                        <input
                          id="form-std-parent"
                          type="text"
                          required
                          value={studentParentName}
                          onChange={(e) => setStudentParentName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Parent Phone *</label>
                        <input
                          id="form-std-phone"
                          type="tel"
                          required
                          value={studentParentPhone}
                          onChange={(e) => setStudentParentPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Assign Class Batch(es)</label>
                        <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2.5 bg-slate-50 space-y-1.5">
                          {batches.length > 0 ? (
                            batches.map((b) => {
                              const currentSelected = studentBatch ? studentBatch.split(',').map((x) => x.trim()).filter(Boolean) : [];
                              const isChecked = currentSelected.includes(b.name);
                              return (
                                <label key={b.id} className="flex items-center gap-2 text-xs font-medium text-slate-705 select-none cursor-pointer hover:bg-white p-1.5 rounded-lg transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      let newSelected: string[];
                                      if (isChecked) {
                                        newSelected = currentSelected.filter(x => x !== b.name);
                                      } else {
                                        newSelected = [...currentSelected, b.name];
                                      }
                                      setStudentBatch(newSelected.join(', '));
                                    }}
                                    className="w-3.5 h-3.5 accent-orange-500 rounded text-orange-500 cursor-pointer"
                                  />
                                  <span className="text-slate-800">{b.name}</span>
                                </label>
                              );
                            })
                          ) : (
                            ['Batch Alpha', 'Batch Beta'].map((defaultBatch) => {
                              const currentSelected = studentBatch ? studentBatch.split(',').map((x) => x.trim()).filter(Boolean) : [];
                              const isChecked = currentSelected.includes(defaultBatch);
                              return (
                                <label key={defaultBatch} className="flex items-center gap-2 text-xs font-medium text-slate-705 select-none cursor-pointer hover:bg-white p-1.5 rounded-lg transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      let newSelected: string[];
                                      if (isChecked) {
                                        newSelected = currentSelected.filter(x => x !== defaultBatch);
                                      } else {
                                        newSelected = [...currentSelected, defaultBatch];
                                      }
                                      setStudentBatch(newSelected.join(', '));
                                    }}
                                    className="w-3.5 h-3.5 accent-orange-500 rounded text-orange-500 cursor-pointer"
                                  />
                                  <span className="text-slate-800">{defaultBatch}</span>
                                </label>
                              );
                            })
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Start Credentials Password *</label>
                        <input
                          id="form-std-password"
                          type="text"
                          placeholder="Default password123"
                          value={studentPassword}
                          onChange={(e) => setStudentPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-mono"
                        />
                      </div>
                    </div>

                    {academy?.academyType === 'Coaching / Tuition' && (
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Academic Level (Grade / Division)</label>
                        <input
                          id="form-std-academic"
                          type="text"
                          placeholder="e.g. 10th Grade / Senior Division"
                          value={studentAcademicLevel}
                          onChange={(e) => setStudentAcademicLevel(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                        />
                      </div>
                    )}

                    {academy?.academyType === 'Dance Academy' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Dance Style specialization</label>
                          <input
                            id="form-std-dancestyle"
                            type="text"
                            placeholder="e.g. Hip-Hop / Ballet / Contemporary"
                            value={studentDanceStyle}
                            onChange={(e) => setStudentDanceStyle(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">dancer skill rank</label>
                          <input
                            id="form-std-skilldance"
                            type="text"
                            placeholder="e.g. Beginner / Advanced Elite"
                            value={studentSkillLevel}
                            onChange={(e) => setStudentSkillLevel(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                          />
                        </div>
                      </div>
                    )}

                    {academy?.academyType === 'Music Academy' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Primary Instrument</label>
                          <input
                            id="form-std-instrument"
                            type="text"
                            placeholder="e.g. Piano / Guitar / Drums"
                            value={studentInstrumentCategory}
                            onChange={(e) => setStudentInstrumentCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Music Skill Level / Grade</label>
                          <input
                            id="form-std-skillmusic"
                            type="text"
                            placeholder="e.g. Grade 5 / Intermediate / Pro"
                            value={studentSkillLevel}
                            onChange={(e) => setStudentSkillLevel(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Instructor Private Annotations / Notes</label>
                      <textarea
                        id="form-std-notes"
                        rows={2}
                        value={studentNotes}
                        onChange={(e) => setStudentNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 p-3.5 border border-slate-100 rounded-xl text-xs">
                      <input 
                        type="checkbox" 
                        id="form-std-disabled"
                        checked={studentDisabled}
                        onChange={(e) => setStudentDisabled(e.target.checked)}
                      />
                      <label htmlFor="form-std-disabled" className="font-semibold text-slate-700 cursor-pointer">Freeze student login? (Disables student portal access)</label>
                    </div>

                    <div className="shrink-0 flex gap-4 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowStudentModal(false)}
                        className="w-1/3 py-2.5 border border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider hover:bg-slate-50 rounded-xl"
                      >
                        Abort
                      </button>
                      <button
                        id="form-std-submit"
                        type="submit"
                        className="w-2/3 py-2.5 bg-slate-950 font-bold text-white text-xs uppercase tracking-wider hover:bg-orange-500 rounded-xl cursor-pointer"
                      >
                        Deploy Record
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* BATCHES MANAGER */}
        {(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'batches' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-baseline sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-slate-900 uppercase">Academy Batch managers</h3>
                <p className="text-slate-400 text-xs mt-1">Create batches, organize class cohorts, and manage pupil placement rosters.</p>
              </div>
              
              <button
                id="add-batch-trigger-btn"
                onClick={() => {
                  setEditingBatch(null);
                  setBatchName('');
                  setBatchDescription('');
                  setShowBatchModal(true);
                }}
                className="px-4 py-2.5 bg-orange-500 font-bold text-xs uppercase tracking-wider text-white hover:bg-orange-600 transition-colors rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm shadow-orange-500/10"
              >
                <Plus className="w-4 h-4" /> Create Batch
              </button>
            </div>

            {/* List of Batches */}
            {batches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {batches.map((b) => {
                  const batchStudents = students.filter((s) => s.batch && s.batch.split(',').map((x) => x.trim()).includes(b.name));
                  return (
                    <div 
                      key={b.id} 
                      className="bg-white p-6 border border-slate-200/60 rounded-3xl shadow-sm flex flex-col justify-between hover:border-orange-200 transition-all relative overflow-hidden"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900 text-base leading-tight flex items-center gap-2">
                              <Layers className="w-4.5 h-4.5 text-orange-500" />
                              {b.name}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-bold font-mono uppercase bg-slate-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                              ID: {b.id}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingBatch(b);
                                setBatchName(b.name);
                                setBatchDescription(b.description || '');
                                setShowBatchModal(true);
                              }}
                              className="p-1 px-2 text-xs border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg shrink-0 cursor-pointer flex items-center gap-1 font-semibold"
                              title="Edit Batch metadata"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBatch(b.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0 cursor-pointer"
                              title="Delete Batch record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {b.description && (
                          <p className="text-slate-500 text-xs italic leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                            "{b.description}"
                          </p>
                        )}

                        <div className="pt-2">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-700 uppercase tracking-widest text-[10px] mb-2">
                            <span>Batch Pupils Roster ({batchStudents.length})</span>
                            <button
                              className="text-orange-500 hover:text-orange-600 text-xs font-black lowercase shrink-0 cursor-pointer hover:underline"
                              onClick={() => {
                                setShowBatchAssignModal(b);
                                setAssignStudentIds(batchStudents.map((s) => s.id));
                              }}
                            >
                              + add/remove students
                            </button>
                          </div>

                          {batchStudents.length > 0 ? (
                            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
                              {batchStudents.map((s) => (
                                <div key={s.id} className="flex items-center justify-between text-xs py-1.5 first:pt-0">
                                  <div className="flex items-center gap-2">
                                    <img 
                                      src={s.profilePhoto} 
                                      alt={s.name} 
                                      className="w-5 h-5 rounded-full object-cover" 
                                    />
                                    <span className="font-semibold text-slate-800">{s.name}</span>
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400">{s.id}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic py-2 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                              No students placed in this batch yet. Click add/remove above to enroll students.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60 max-w-lg mx-auto">
                <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No Custom Batches Registered</h3>
                <p className="text-slate-400 text-xs mt-1">Create your first academy batch class cohort using the CTA button above.</p>
              </div>
            )}

            {/* Modal - Create/Edit Batch */}
            {showBatchModal && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border rounded-3xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <h3 className="text-base font-black text-slate-950 uppercase">
                      {editingBatch ? 'Edit Batch metadata' : 'Create New Batch'}
                    </h3>
                    <button 
                      onClick={() => setShowBatchModal(false)} 
                      className="text-slate-400 hover:text-slate-800 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveBatch} className="p-6 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Batch Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Afternoon Grade-11, Morning Yoga"
                        value={batchName}
                        onChange={(e) => setBatchName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Batch Description / Timings</label>
                      <textarea
                        rows={3}
                        placeholder="Specify timing details, class schedules, or specialization (e.g. Mon/Wed/Fri 2:00 PM - 3:30 PM)"
                        value={batchDescription}
                        onChange={(e) => setBatchDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-medium text-slate-700"
                      />
                    </div>

                    <div className="shrink-0 flex gap-4 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowBatchModal(false)}
                        className="w-1/3 py-2.5 border border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider hover:bg-slate-50 rounded-xl"
                      >
                        Abort
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 py-2.5 bg-slate-950 font-bold text-white text-xs uppercase tracking-wider hover:bg-orange-500 rounded-xl cursor-pointer"
                      >
                        Deploy Batch
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal - Batch Pupils / Assign Students */}
            {showBatchAssignModal && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border rounded-3xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <div>
                      <h3 className="text-base font-black text-slate-950 uppercase">Place Students</h3>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider font-sans mt-0.5 text-orange-500 font-mono">
                        Batch: {showBatchAssignModal.name}
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowBatchAssignModal(null)} 
                      className="text-slate-400 hover:text-slate-800 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 overflow-y-auto flex-grow space-y-4">
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      Select students from the registered academy pool to enroll them into <span className="font-bold text-slate-800">{showBatchAssignModal.name}</span>. Unchecked students who are currently placed in this batch will be unassigned.
                    </p>

                    {students.length > 0 ? (
                      <div className="space-y-2 border border-slate-100 p-3 rounded-2xl max-h-64 overflow-y-auto bg-slate-50/50">
                        {students.map((s) => {
                          const isChecked = assignStudentIds.includes(s.id);
                          return (
                            <label 
                              key={s.id} 
                              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none ${isChecked ? 'bg-orange-50/50 border-orange-200' : 'bg-white border-slate-100/80 hover:border-slate-205'}`}
                            >
                              <div className="flex items-center gap-3">
                                <img src={s.profilePhoto} alt={s.name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-100" />
                                <div>
                                  <p className="text-xs font-bold text-slate-800">{s.name}</p>
                                  <p className="text-[9px] text-slate-400 font-semibold">
                                    Current Place: {s.batch ? s.batch : 'Unassigned'}
                                  </p>
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setAssignStudentIds(assignStudentIds.filter((id) => id !== s.id));
                                  } else {
                                    setAssignStudentIds([...assignStudentIds, s.id]);
                                  }
                                }}
                                className="w-4 h-4 accent-orange-500 rounded text-orange-500 cursor-pointer"
                              />
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center py-6">
                        No students enrolled in your academy directory yet.
                      </p>
                    )}
                  </div>

                  <div className="p-6 border-t border-slate-100 shrink-0 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowBatchAssignModal(null)}
                      className="w-1/3 py-2.5 border border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider hover:bg-slate-50 rounded-xl"
                    >
                      Abort
                    </button>
                    <button
                      onClick={() => handleUpdateBatchAssignments(showBatchAssignModal, assignStudentIds)}
                      className="w-2/3 py-2.5 bg-slate-950 font-bold text-white text-xs uppercase tracking-wider hover:bg-orange-500 rounded-xl cursor-pointer"
                    >
                      Deploy Placement
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* 3. ATTENDANCE MODULE */}
        {(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-white p-6 border border-slate-200/60 rounded-3xl shadow-sm flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4 flex-wrap items-center">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Select Batch</label>
                  <select
                    id="attendance-batch-select"
                    value={attendanceBatch}
                    onChange={(e) => setAttendanceBatch(e.target.value)}
                    className="px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-800"
                  >
                    {batches.length > 0 ? (
                      batches.map((b) => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="Batch Alpha">Batch Alpha</option>
                        <option value="Batch Beta">Batch Beta</option>
                        <option value="Batch Gamma">Batch Gamma</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Log Date</label>
                  <input
                    id="attendance-date"
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-mono select-none"
                  />
                </div>
              </div>

              <button
                id="save-attendance-btn"
                onClick={handleMarkAttendance}
                className="px-6 py-2.5 bg-orange-500 font-bold text-xs uppercase text-white hover:bg-orange-600 transition-colors rounded-xl shadow-sm shadow-orange-500/10 cursor-pointer"
              >
                Sync & Safe Attendance
              </button>
            </div>

            {/* Attendance Roster Table */}
            <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h4 className="font-bold text-slate-950 text-sm">Roster Logging Table</h4>
                <span className="text-xs text-slate-400 font-mono">Date ID: {attendanceDate} &bull; {attendanceBatch}</span>
              </div>

              {students.filter(s => s.batch && s.batch.split(',').map(x => x.trim()).includes(attendanceBatch)).length > 0 ? (
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                      <th className="p-4">Student ID</th>
                      <th className="p-4">Full Name</th>
                      <th className="p-4 text-center">Roster Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {students.filter(s => s.batch && s.batch.split(',').map(x => x.trim()).includes(attendanceBatch)).map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/20 transition-colors">
                        <td className="p-4 font-mono text-[11px] text-orange-500">{s.id}</td>
                        <td className="p-4 font-bold text-slate-900">{s.name}</td>
                        <td className="p-4 text-center flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleStudentAttendanceBoxChange(s.id, 'present')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${attendanceRecords[s.id] === 'present' ? 'bg-emerald-50 text-emerald-600 border-emerald-300' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleStudentAttendanceBoxChange(s.id, 'late')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${attendanceRecords[s.id] === 'late' ? 'bg-amber-50 text-amber-600 border-amber-300' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                          >
                            Late
                          </button>
                          <button
                            onClick={() => handleStudentAttendanceBoxChange(s.id, 'absent')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${attendanceRecords[s.id] === 'absent' ? 'bg-red-50 text-red-600 border-red-300' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                          >
                            Absent
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-xs text-slate-400">
                  No students matching batch "{attendanceBatch}" on directory log registry.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* 4. FEE MANAGEMENT */}
        {(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'fees' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 uppercase">Financial ledger dues</h3>
              <button
                id="create-fee-invoice-trigger-btn"
                onClick={() => setShowFeeModal(true)}
                className="px-4 py-2.5 bg-orange-500 text-xs font-bold uppercase tracking-wider text-white hover:bg-orange-600 transition-colors rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm shadow-orange-500/10"
              >
                <Plus className="w-4 h-4" /> Issue Invoice
              </button>
            </div>

            {/* Fees list */}
            <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <th className="p-4">Invoice ID</th>
                    <th className="p-4">Student</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Receipt Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {fees.length > 0 ? (
                    fees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-slate-50/25 transition-colors">
                        <td className="p-4 font-mono text-xs">{fee.id}</td>
                        <td className="p-4 font-bold text-slate-900">{fee.studentName}</td>
                        <td className="p-4 font-black font-sans text-slate-950">${fee.amount.toFixed(2)}</td>
                        <td className="p-4 font-mono text-slate-500">{fee.dueDate}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleFeeStatus(fee)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full border cursor-pointer border-slate-200 ${
                              fee.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                            }`}
                          >
                            {fee.status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                          </button>
                        </td>
                        <td className="p-4 text-center font-mono text-slate-500">{fee.receiptNumber || 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-xs text-slate-400 font-medium">
                        Tuition collection table empty. Click issued invoices to set records.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Fee Dialog */}
            {showFeeModal && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border rounded-3xl w-full max-w-md shadow-xl overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-base font-black text-slate-950 uppercase">Issue Invoice</h3>
                    <button onClick={() => setShowFeeModal(false)} className="text-slate-400 hover:text-slate-800 cursor-pointer"><X className="w-5 h-5" /></button>
                  </div>

                  <form onSubmit={handleCreateFee} className="p-6 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Select student recipient</label>
                      <select
                        id="choose-fee-student-dropdown"
                        value={feeStudentId}
                        onChange={(e) => setFeeStudentId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs sm:text-sm focus:outline-none"
                      >
                        <option value="">-- Choose Pupil --</option>
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Dues Amount ($)</label>
                        <input
                          id="form-fee-amount"
                          type="number"
                          placeholder="e.g. 150"
                          value={feeAmount}
                          onChange={(e) => setFeeAmount(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Dues Timelimit Date</label>
                        <input
                          id="form-fee-due"
                          type="date"
                          value={feeDueDate}
                          onChange={(e) => setFeeDueDate(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 border-t border-slate-100 pt-4 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowFeeModal(false)}
                        className="w-1/3 py-2 border border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider hover:bg-slate-50 rounded-xl"
                      >
                        Abort
                      </button>
                      <button
                        id="form-fee-submit-btn"
                        type="submit"
                        className="w-2/3 py-2 bg-slate-950 hover:bg-orange-500 font-bold text-white text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow"
                      >
                        Commit Invoice
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* 5. NOTICE BULLETINS */}
        {(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'notices' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 uppercase">Announcements</h3>
              
              <button
                id="create-notice-announcement-btn"
                onClick={() => setShowNoticeModal(true)}
                className="px-4 py-2.5 bg-orange-500 text-xs font-bold uppercase tracking-wider text-white hover:bg-orange-600 transition-colors rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Plus className="w-4 h-4" /> Add Announcement
              </button>
            </div>

            {/* Bulletin records list */}
            {notices.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {notices.map((n) => (
                  <div key={n.id} className={`bg-white p-6 border rounded-3xl shadow-sm relative ${n.isPinned ? 'border-l-4 border-l-orange-500 border-slate-200' : 'border-slate-200/60'}`}>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        {n.isPinned && <span className="px-2 py-0.5 bg-orange-50 rounded text-[9px] font-bold text-orange-600 block w-max mb-1.5 uppercase font-mono">PINNED</span>}
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">{n.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {n.createdAt?.seconds ? new Date(n.createdAt.seconds * 1000).toLocaleDateString() : 'Date pending'}
                        </span>
                        <button
                          onClick={() => handleDeleteNotice(n.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-650 text-xs sm:text-sm mt-3 whitespace-pre-wrap leading-relaxed">{n.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60">
                <Bell className="w-10 h-10 text-slate-350 mx-auto mb-3 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-800">No active bulletins posted</h3>
                <p className="text-slate-400 text-xs mt-1">Issue a real-time broadcast and ping student terminals using the CTA above.</p>
              </div>
            )}

            {/* Notice Dialog */}
            {showNoticeModal && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border rounded-3xl w-full max-w-md shadow-xl overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <h3 className="text-base font-black text-slate-950 uppercase">Broadcasting Issue</h3>
                    <button onClick={() => setShowNoticeModal(false)} className="text-slate-400 hover:text-slate-800 cursor-pointer"><X className="w-5 h-5" /></button>
                  </div>

                  <form onSubmit={handleDeployNotice} className="p-6 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Announcement Title *</label>
                      <input
                        id="form-notice-title"
                        type="text"
                        required
                        placeholder="e.g. Christmas Timings Update"
                        value={noticeTitle}
                        onChange={(e) => setNoticeTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Detailed Content Paragraphs *</label>
                      <textarea
                        id="form-notice-body"
                        required
                        rows={4}
                        placeholder="Enter timings, notes, details..."
                        value={noticeContent}
                        onChange={(e) => setNoticeContent(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100/50 text-xs">
                      <input 
                        type="checkbox" 
                        id="form-notice-pinned"
                        checked={noticePinned}
                        onChange={(e) => setNoticePinned(e.target.checked)}
                      />
                      <label htmlFor="form-notice-pinned" className="font-semibold text-slate-700 cursor-pointer">Pin to header of student terminal notices drawer?</label>
                    </div>

                    <div className="flex gap-4 border-t border-slate-100 pt-4 mt-6 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowNoticeModal(false)}
                        className="w-1/3 py-2 border border-slate-200 text-slate-600 font-semibold text-xs uppercase hover:bg-slate-55 rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        id="form-notice-submit-btn"
                        type="submit"
                        className="w-2/3 py-2 bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-900 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer font-semibold shadow"
                      >
                        Publish Announcement
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* 6. WEEKLY CLASS SCHEDULER */}
        {(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 uppercase">Class Schedule</h3>
              <button
                id="create-schedule-timetable-btn"
                onClick={() => setShowScheduleModal(true)}
                className="px-4 py-2.5 bg-orange-500 text-xs font-bold uppercase tracking-wider text-white hover:bg-orange-600 transition-colors rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Plus className="w-4 h-4" /> Add Class
              </button>
            </div>

            {/* Schedule timetable highlights */}
            {schedules.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {schedules.map((sch) => (
                  <div key={sch.id} className="bg-white p-6 border border-slate-200/60 rounded-3xl shadow-sm flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-slate-55 rounded-xl text-orange-500 shrink-0 flex items-center justify-center">
                        <Clock className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-orange-500 font-mono block mb-0.5">{sch.dayOfWeek} &bull; {sch.batchName}</span>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">{sch.className}</h4>
                        <span className="text-[11px] text-slate-500 font-medium block mt-1.5">Hours: {sch.startTime} - {sch.endTime}</span>
                        <span className="text-[10px] text-slate-400 italic block mt-1">Instructor: {sch.teacherName}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSchedule(sch.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60">
                <CalendarDays className="w-10 h-10 text-slate-350 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">Your scheduler ledger is blank</h3>
                <p className="text-slate-400 text-xs mt-1">Bind periodic hours, batch, class subject index, and tutors together.</p>
              </div>
            )}

            {/* Schedule picker dialog */}
            {showScheduleModal && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border rounded-3xl w-full max-w-md shadow-xl overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <h3 className="text-base font-black text-slate-950 uppercase">Scheduler Picker</h3>
                    <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-800 cursor-pointer"><X className="w-5 h-5" /></button>
                  </div>

                  <form onSubmit={handleAddSchedule} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Target Batch</label>
                        <select
                          id="form-sch-batch"
                          value={schBatchName}
                          onChange={(e) => setSchBatchName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs sm:text-sm font-semibold text-slate-800"
                        >
                          {batches.length > 0 ? (
                            batches.map((b) => (
                              <option key={b.id} value={b.name}>{b.name}</option>
                            ))
                          ) : (
                            <>
                              <option value="Batch Alpha">Batch Alpha</option>
                              <option value="Batch Beta">Batch Beta</option>
                              <option value="Batch Gamma">Batch Gamma</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Class Subject</label>
                        <input
                          id="form-sch-class-name"
                          type="text"
                          required
                          placeholder="e.g. Ballet Basics"
                          value={schClassName}
                          onChange={(e) => setSchClassName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-sans"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Day of Week</label>
                        <select
                          id="form-sch-day"
                          value={schDayOfWeek}
                          onChange={(e) => setSchDayOfWeek(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs sm:text-sm"
                        >
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                          <option value="Sunday">Sunday</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Instructor / Tutor *</label>
                        <input
                          id="form-sch-teacher"
                          type="text"
                          required
                          placeholder="e.g. Master Rajesh"
                          value={schTeacherName}
                          onChange={(e) => setSchTeacherName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Start Hour</label>
                        <input
                          id="form-sch-start"
                          type="time"
                          value={schStartTime}
                          onChange={(e) => setSchStartTime(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">End Hour</label>
                        <input
                          id="form-sch-end"
                          type="time"
                          value={schEndTime}
                          onChange={(e) => setSchEndTime(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 border-t border-slate-100 pt-4 mt-6 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowScheduleModal(false)}
                        className="w-1/3 py-2 border border-slate-200 text-slate-600 font-semibold text-xs uppercase hover:bg-slate-55 rounded-xl"
                      >
                        Abort
                      </button>
                      <button
                        id="form-sch-submit-btn"
                        type="submit"
                        className="w-2/3 py-2 bg-slate-950 hover:bg-orange-500 font-bold text-white text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow"
                      >
                        Save class hours
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* 7. PORTFOLIOS CONSOLE */}
        {(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'portfolio' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Student selectors */}
            <div className="md:col-span-1 bg-white border border-slate-200/60 p-4 rounded-3xl space-y-4">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase pb-2 border-b border-slate-100 tracking-wider">Showcase List</h4>
              
              <div className="space-y-1.5 max-h-[440px] overflow-y-auto">
                {students.map((std) => (
                  <button
                    key={std.id}
                    onClick={() => handleSelectPortfolioStudent(std.id)}
                    className={`w-full text-left p-3 rounded-xl flex items-center justify-between text-xs font-semibold border transition-all ${selectedPortfolioId === std.id ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-slate-100 text-slate-750 hover:bg-slate-50'}`}
                  >
                    <span>{std.name}</span>
                    <span className="font-mono text-[9px] text-slate-400">{std.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Custom portfolio additions */}
            <div className="md:col-span-2 space-y-6">
              {portfolioData && (
                <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-baseline sm:items-center gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">PORTFOLIO DESK EDITOR</span>
                      <h3 className="text-lg font-black text-slate-950 mt-0.5">Edit {students.find(s=>s.id === selectedPortfolioId)?.name} Showcase</h3>
                    </div>
                    
                    <a 
                      href={`/portfolio/${selectedPortfolioId}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs text-orange-500 font-bold hover:underline"
                    >
                      View Live Portfolio &rarr;
                    </a>
                  </div>

                  <div className="h-px bg-slate-100 w-full" />

                  {/* Portfolio configurations settings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-650 mb-1">Teacher custom Feedback endorsement</label>
                      <textarea
                        id="portfolio-feedback-input"
                        rows={2}
                        value={portfolioFeedback}
                        onChange={(e) => setPortfolioFeedback(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 text-xs sm:text-sm rounded-xl font-sans"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 bg-slate-50 p-3.5 border border-slate-100 rounded-xl text-xs">
                        <input 
                          type="checkbox" 
                          id="portfolio-visible-checkbox"
                          checked={portfolioVisible}
                          onChange={(e) => setPortfolioVisible(e.target.checked)}
                        />
                        <label htmlFor="portfolio-visible-checkbox" className="font-bold text-slate-700 cursor-pointer">Set showcase public visibility to true?</label>
                      </div>
                      
                      <button
                        onClick={handleUpdatePortfolioMetadata}
                        className="w-full py-2 bg-slate-950 text-xs font-bold uppercase tracking-wider text-white hover:bg-orange-500 rounded-xl transition-colors cursor-pointer"
                      >
                        Keep Visibility & comments In sync
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 w-full" />

                  {/* Sub Adders: Achievements, Grade evaluations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Achievement Adder */}
                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                      <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider mb-3">Highlight Accomplishments</h4>
                      <input
                        type="text"
                        placeholder="e.g. Best Dancer of the Month"
                        value={newAchievementTitle}
                        onChange={(e) => setNewAchievementTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 text-xs bg-white rounded-xl mb-2"
                      />
                      <input
                        type="text"
                        placeholder="Description text..."
                        value={newAchievementDesc}
                        onChange={(e) => setNewAchievementDesc(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 text-xs bg-white rounded-xl mb-4"
                      />
                      <button
                        onClick={handleAddAchievement}
                        className="w-full py-2 bg-orange-500 text-white font-bold text-xs uppercase transition-colors rounded-xl font-mono cursor-pointer"
                      >
                        Add Achievement
                      </button>
                    </div>

                    {/* Grade evaluation adder */}
                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                      <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider mb-3">Add Semester Grade evaluation</h4>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Subject"
                          value={gradeSubject}
                          onChange={(e) => setGradeSubject(e.target.value)}
                          className="col-span-2 px-3 py-2 border border-slate-200 text-xs bg-white rounded-xl"
                        />
                        <select
                          value={gradeValue}
                          onChange={(e) => setGradeValue(e.target.value)}
                          className="px-2 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold"
                        >
                          <option value="A+">A+</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        placeholder="Score (e.g. 96/100)"
                        value={gradeScore}
                        onChange={(e) => setGradeScore(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 text-xs bg-white rounded-xl mb-2"
                      />
                      <input
                        type="text"
                        placeholder="Brief feedback comments..."
                        value={gradeComments}
                        onChange={(e) => setGradeComments(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 text-xs bg-white rounded-xl mb-4"
                      />
                      <button
                        onClick={handleAddGradeReport}
                        className="w-full py-2 bg-orange-500 text-white font-bold text-xs uppercase transition-colors rounded-xl font-mono cursor-pointer"
                      >
                        Add Mark Roster
                      </button>
                    </div>
                  </div>

                  {/* Certificates & Media item lists */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                    {/* Certification binder */}
                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                      <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider mb-3">Bind Certifications Documents</h4>
                      <input
                        type="text"
                        placeholder="Certificate Title"
                        value={newCertTitle}
                        onChange={(e) => setNewCertTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 text-xs bg-white rounded-xl mb-2"
                      />
                      <input
                        type="text"
                        placeholder="Issuer Authority"
                        value={newCertIssuer}
                        onChange={(e) => setNewCertIssuer(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 text-xs bg-white rounded-xl mb-2"
                      />
                      <input
                        type="text"
                        placeholder="Document URL / Base64 Data URL..."
                        value={newCertUrl}
                        onChange={(e) => setNewCertUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 text-xs bg-white rounded-xl mb-4 font-mono text-[10px]"
                      />
                      <button
                        onClick={handleAddCertificate}
                        className="w-full py-2 bg-slate-950 text-white font-bold text-xs uppercase transition-colors rounded-xl font-mono cursor-pointer"
                      >
                        Deploy Credentials
                      </button>
                    </div>

                    {/* Media activity drawings adder */}
                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                      <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider mb-3">Add Activity Media photos</h4>
                      <input
                        type="text"
                        placeholder="Activity / Event Title"
                        value={newGalleryTitle}
                        onChange={(e) => setNewGalleryTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 text-xs bg-white rounded-xl mb-2"
                      />
                      <input
                        type="text"
                        placeholder="Photo URL / Base64 Source..."
                        value={newGalleryUrl}
                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 text-xs bg-white rounded-xl mb-4 font-mono text-[10px]"
                      />
                      <button
                        onClick={handleAddGalleryItem}
                        className="w-full py-2 bg-slate-950 text-white font-bold text-xs uppercase transition-colors rounded-xl font-mono cursor-pointer"
                      >
                        Publish Photo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* 8. MESSENGER DESK */}
        {(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'chat' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white border border-slate-200/60 shadow-lg rounded-3xl h-[520px] overflow-hidden">
            {/* Left selector menu - active chats threads */}
            <div className="md:col-span-1 border-r border-slate-100 flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-slate-150 shrink-0">
                <h4 className="font-bold text-slate-950 text-xs sm:text-sm uppercase tracking-wider">Active Channels</h4>
              </div>

              <div className="flex-grow overflow-y-auto p-2.5 space-y-1">
                {chatThreads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedStudentChatId(thread.studentId)}
                    className={`w-full text-left p-3 rounded-xl flex flex-col gap-1 text-xs border transition-all ${selectedStudentChatId === thread.studentId ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-slate-50 text-slate-750 hover:bg-slate-50'}`}
                  >
                    <div className="flex justify-between items-baseline w-full">
                      <strong className="font-bold text-slate-900 truncate leading-none mb-1 text-left">{thread.studentName}</strong>
                      {thread.unreadCountTeacher > 0 && <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0 ml-1" />}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{thread.lastMessage}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Right stream panel */}
            <div className="md:col-span-2 flex flex-col h-full overflow-hidden relative">
              {selectedStudentChatId ? (
                <>
                  {/* Streaming Header with filter terms */}
                  <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0 bg-slate-50/20">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center font-bold text-white text-xs uppercase shadow-sm">
                        {chatThreads.find(t=>t.studentId === selectedStudentChatId)?.studentName?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 leading-none">{chatThreads.find(t=>t.studentId === selectedStudentChatId)?.studentName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono mt-1 block">ID: {selectedStudentChatId}</span>
                      </div>
                    </div>

                    <div className="relative w-full sm:w-56">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        id="chat-desk-keyword-filter"
                        type="text"
                        placeholder="Filter messages..."
                        value={chatSearch}
                        onChange={(e) => setChatSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* Messaging board scrolling stream */}
                  <div className="flex-grow p-6 overflow-y-auto bg-slate-50/50 space-y-4">
                    {chatMessages.filter(m => m.content.toLowerCase().includes(chatSearch.toLowerCase())).map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col max-w-[75%] gap-1 ${msg.senderRole === 'teacher' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <div 
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                            msg.senderRole === 'teacher' 
                              ? 'bg-slate-900 text-white rounded-br-none' 
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                          }`}
                        >
                          {msg.imageUrl && (
                            <img 
                              src={msg.imageUrl} 
                              alt="Screenshot preview" 
                              className="max-w-[170px] max-h-[170px] object-cover rounded-md mb-2 border border-slate-100/10" 
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <span>{msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Sync'}</span>
                          {msg.senderRole === 'teacher' && (
                            <span>{msg.read ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500 font-bold" /> : <Check className="w-3.5 h-3.5 text-slate-350" />}</span>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messageEndRef} />
                  </div>

                  {/* Image attachment slot */}
                  {chatImageBase64 && (
                    <div className="p-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between px-6 shrink-0">
                      <div className="flex items-center gap-2">
                        <img src={chatImageBase64} alt="Image upload attached" className="w-10 h-10 object-cover rounded-lg border bg-white p-0.5 border-slate-200" />
                        <span className="text-[10px] text-orange-500 font-bold">Screenshot appended</span>
                      </div>
                      <button onClick={() => setChatImageBase64('')} className="text-xs text-slate-400 hover:text-red-500 font-bold uppercase cursor-pointer">Remove</button>
                    </div>
                  )}

                  {/* Outgoing actions forms */}
                  <form onSubmit={handleSendChatMessage} className="p-4 border-t border-slate-100 bg-white flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => chatFileRef.current?.click()}
                      className="w-10 h-10 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
                      title="Attach Image"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    
                    <input 
                      ref={chatFileRef}
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => attachBase64Image(e, setChatImageBase64)}
                      className="hidden" 
                    />

                    <input
                      id="chat-send-input"
                      type="text"
                      placeholder="Type response or details..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-grow px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none"
                    />

                    <button
                      id="chat-send-submit-btn"
                      type="submit"
                      className="w-10 h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-xs text-slate-500 leading-relaxed max-w-sm mx-auto select-none">
                  <MessageSquare className="w-10 h-10 text-slate-250 mb-3 animate-pulse" />
                  <h4 className="font-bold text-slate-800">Your messenger desk is empty</h4>
                  <p className="mt-1">Students can text you from their terminals, instantly receiving updates.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* 9. REPORTS AND PDF GENERATION TOOL */}
        {(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'reports' && (
          true ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-baseline sm:items-center gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 uppercase">Academy Analytics ledger</h3>
                  <p className="text-xs text-slate-500">Formulate rosters summaries and printable audits.</p>
                </div>

                <button
                  id="export-pdf-action-btn"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2.5 bg-orange-500 text-xs font-bold uppercase tracking-wider text-white hover:bg-orange-600 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <FileDown className="w-4 h-4" /> Print PDF Report
                </button>
              </div>

              {/* Reports content details - formatted to look pristine on PDF print (landscape/portrait print support) */}
              <div id="print-area" className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 border border-slate-200/60 rounded-3xl shadow-sm">
                
                {/* Financial summary metrics row */}
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl md:col-span-1">
                  <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-orange-500" /> Fees Overview</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 p-4 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Pending Amount</span>
                      <span className="text-xl font-bold text-red-500 block mt-1">${getAcademySumPendingFees()}</span>
                    </div>
                    <div className="bg-white border border-slate-200 p-4 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Collected Amount</span>
                      <span className="text-xl font-bold text-emerald-500 block mt-1">
                        ${fees.filter(f => f.status === 'paid').reduce((acc, f) => acc + f.amount, 0)}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-slate-200 my-4" />
                  <div className="text-[11px] leading-relaxed text-slate-500 font-sans">
                    * Metrics computed from {fees.length} total invoices.
                  </div>
                </div>

                {/* Attendance metrics details */}
                <div className="p-6 bg-slate-50 border border-slate-150 rounded-2xl md:col-span-1">
                  <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-orange-500" /> Roster Attendance audit</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 p-4 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Average Attendance Rate</span>
                      <span className="text-xl font-bold text-orange-500 block mt-1">{getAttendanceSummaryPercentage()}%</span>
                    </div>
                    <div className="bg-white border border-slate-200 p-4 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Roster tracks</span>
                      <span className="text-xl font-bold text-slate-800 block mt-1">{attendance.length} dates</span>
                    </div>
                  </div>

                  <div className="h-px bg-slate-200 my-4" />
                  <div className="text-[11px] leading-relaxed text-slate-500 font-sans">
                    * Roster tracked across {students.flatMap(s => s.batch ? s.batch.split(',').map(b => b.trim()) : []).filter((val, idx, arr) => arr.indexOf(val) === idx && val !== '').length} different academic batches.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center text-center p-8 bg-slate-50 border border-slate-200 rounded-xl">
              <Lock className="w-10 h-10 text-slate-400 mb-3" />
              <h3 className="text-lg font-bold text-slate-900">Premium Features Locked</h3>
              <p className="text-slate-600 mt-2 max-w-sm">Premium analytics and PDF exporting are currently unavailable.</p>
            </div>
          )
        )}

        {/* ======================================= */}
        {/* 9.25 HOMEWORK BOARD */}
        {(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && (activeTab === 'extra-module' || activeTab === 'homeworks') && academy && (
          <TeacherHomeworks
            academyId={academyId}
            batches={batches}
            students={students}
            academyType={academy.academyType}
          />
        )}

        {/* ======================================= */}
        {/* 9.5 PUBLIC PROFILE BUILDER */}
        {(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'public-profile' && academy && (
          true ? (
            <PublicProfileBuilder
              academyId={academyId}
              academy={academy}
              students={students}
              admissionRequests={admissionRequests}
              inquiries={inquiries}
              onUpdateAcademy={(updated) => setAcademy(updated)}
            />
          ) : (
             <div className="py-6 px-4 text-center">
               <p className="text-sm text-slate-500">Premium plan features are currently locked.</p>
             </div>
          )
        )}

        {/* ======================================= */}
        {/* 9.6 INSTRUCTORS & TEACHERS MANAGER */}
        {(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'teachers' && academy && (
          <InstructorsManager
            academyId={academyId}
            academy={academy}
            onUpdateAcademy={(updated) => setAcademy(updated)}
          />
        )}

        {/* ======================================= */}
        {/* 9.7 CHOREOGRAPHIES & SUBJECTS MANAGER */}
        {(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'subjects' && academy && (
          <SubjectsManager
            academyId={academyId}
            academy={academy}
            onUpdateAcademy={(updated) => setAcademy(updated)}
          />
        )}

        {/* ======================================= */}
        {/* 9.8 EVENTS & TESTS & RECITALS MANAGER */}
        {(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'tests' && academy && (
          <EventsManager
            academyId={academyId}
            academy={academy}
            onUpdateAcademy={(updated) => setAcademy(updated)}
          />
        )}
        
        {/* ======================================= */}
        {/* 10. AGENCY SETTINGS */}
        {(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'settings' && academy && (
          <div className="space-y-6 animate-fadeIn">
            <form onSubmit={handleUpdateSettings} className="bg-white p-8 border border-slate-200/60 rounded-3xl shadow-sm space-y-6">
              <h3 className="font-bold text-slate-950 uppercase shrink-0 pb-2 border-b border-slate-100">Academy Profile Configuration</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Institution Full Name *</label>
                  <input
                    id="settings-inst-name"
                    type="text"
                    required
                    value={setInstName}
                    onChange={(e) => setSetInstName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Academy Email Address *</label>
                  <input
                    id="settings-inst-email"
                    type="email"
                    required
                    value={setInstEmail}
                    onChange={(e) => setSetInstEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Billing UPI ID *</label>
                  <input
                    id="settings-inst-upi"
                    type="text"
                    required
                    value={setInstUpi}
                    onChange={(e) => setSetInstUpi(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Phone Number *</label>
                    <input
                      id="settings-inst-phone"
                      type="tel"
                      required
                      value={setInstPhone}
                      onChange={(e) => setSetInstPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Physical Address *</label>
                    <input
                      id="settings-inst-address"
                      type="text"
                      required
                      value={setInstAddress}
                      onChange={(e) => setSetInstAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-sans"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Billing & Payment instructions text details</label>
                <textarea
                  id="settings-inst-instruct"
                  rows={3}
                  value={setInstPayment}
                  onChange={(e) => setSetInstPayment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-sans text-slate-650"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* Logo binder upload slot */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Upload Institution Logo</label>
                  <div 
                    onClick={() => settingLogoRef.current?.click()}
                    className="border border-dashed border-slate-300 hover:border-orange-500 py-6 text-center cursor-pointer rounded-2xl bg-slate-50 flex flex-col items-center gap-1.5"
                  >
                    {setInstLogo ? (
                      <img src={setInstLogo} alt="Logo attached Preview" className="w-16 h-16 object-contain rounded border bg-white p-1" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-slate-400" />
                        <span className="text-xs text-slate-600 font-semibold">Change Logo Icon File</span>
                      </>
                    )}
                    <input 
                      ref={settingLogoRef}
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => attachBase64Image(e, setSetInstLogo)}
                      className="hidden" 
                    />
                  </div>
                </div>

                {/* UPI QR Code upload slot */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Upload Custom UPI QR Code</label>
                  <div 
                    onClick={() => settingQrRef.current?.click()}
                    className="border border-dashed border-slate-300 hover:border-orange-500 py-6 text-center cursor-pointer rounded-2xl bg-slate-50 flex flex-col items-center gap-1.5"
                  >
                    {setInstQr ? (
                      <img src={setInstQr} alt="QR attached Preview" className="w-20 h-20 object-contain rounded border bg-white p-1" />
                    ) : (
                      <>
                        <QrCode className="w-5 h-5 text-slate-400 font-bold" />
                        <span className="text-xs text-slate-600 font-semibold">Change UPI QR Image</span>
                      </>
                    )}
                    <input 
                      ref={settingQrRef}
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => attachBase64Image(e, setSetInstQr)}
                      className="hidden" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end shrink-0">
                <button
                  id="settings-commit-btn"
                  type="submit"
                  className="px-8 py-3 bg-slate-950 font-bold text-xs uppercase tracking-wider text-white hover:bg-orange-500 rounded-xl transition-all cursor-pointer shadow"
                >
                  Commit settings modifications
                </button>
              </div>
            </form>

            {/* Subscriptions management card */}
            <div className="bg-white p-8 border border-slate-200/60 rounded-3xl shadow-sm space-y-6">
              <h3 className="font-bold text-slate-950 uppercase shrink-0 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Billing & Subscriptions</span>
                <span className="text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-bold bg-emerald-50 border border-emerald-500/30 text-emerald-600 animate-pulse">
                  Pro Tier - Active (Promo Unlocked)
                </span>
              </h3>
              
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Flodech Pro - Upgraded Academy</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Your school is fully customized with Flodech Pro features. Premium tools, custom public profiles, and downloadable reports are unlocked.
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-2">
                    ✓ All premium functions unlocked of charge for evaluation/trial.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-xs font-mono text-slate-550">
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400">Order ID Record</span>
                      <span className="font-medium truncate block max-w-[150px] text-slate-700">{academy.subscriptionOrderId || 'PRO_PROMO_FREE'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400">Payment Date</span>
                      <span className="text-slate-700">{academy.subscriptionDate ? new Date(academy.subscriptionDate).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-xl text-center space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Active Rate</span>
                  <span className="text-2xl font-black text-slate-950 block">₹0/mo</span>
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase block tracking-wider mt-1 flex items-center justify-center gap-1">
                    Promo Unlocked
                  </span>
                </div>
              </div>
              
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
