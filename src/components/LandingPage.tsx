/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import logoImg from '../assets/images/logotech_icon_1780152227001.png';
import PricingPage from './PricingPage';

import { 
  Building2, 
  Users, 
  Calendar, 
  CheckCircle2, 
  MessageSquare, 
  Clock, 
  FileText, 
  CreditCard, 
  GraduationCap, 
  Award,
  ChevronDown,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  Loader2,
  Lock,
  X,
  Check,
  Zap,
  ShieldCheck,
  CornerDownRight,
  BookOpen,
  Music
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

function TypewriterEffect() {
  const words = ["Tuition Classes.", "Music Studios.", "Dance Academies.", "One Single Place."];
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);

  // Blinking cursor
  useEffect(() => {
    const timeout = setTimeout(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearTimeout(timeout);
  }, [blink]);

  // Typing effect
  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => setReverse(true), 1500);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 60 : 120);

    return () => clearTimeout(timeout);
  }, [subIndex, reverse, index]);

  return (
    <span className="text-orange-500 font-bold tracking-tight inline-block text-left relative">
      {words[index].substring(0, subIndex)}
      <span className={`inline-block w-[3px] h-[0.9em] bg-orange-500 ml-1 align-middle transition-opacity duration-100 ${blink ? 'opacity-100' : 'opacity-0'}`} />
    </span>
  );
}


export default function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [pricingPeriod, setPricingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const features = [
    {
      icon: <Users className="w-6 h-6 text-orange-500" />,
      title: "Student Management",
      description: "Direct student profiles with parent contacts, batches, and personal notes. Replace paper registers forever."
    },
    {
      icon: <Calendar className="w-6 h-6 text-orange-500" />,
      title: "Attendance Tracking",
      description: "Mark attendance batch-wise or daily in seconds. Automatic monthly percentages and clear history for students."
    },
    {
      icon: <CreditCard className="w-6 h-6 text-orange-500" />,
      title: "Fee Tracking & UPI QR",
      description: "Generate fee dues, upload your custom UPI QR code, and allow instant student validation and payment updates."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-orange-500" />,
      title: "Internal Chat System",
      description: "Secure, real-time student-teacher communication. Share images, worksheets, and documents with active search."
    },
    {
      icon: <FileText className="w-6 h-6 text-orange-500" />,
      title: "Notices & Announcements",
      description: "Pin notices, events, and schedules. Instantly push critical news to all student dashboards."
    },
    {
      icon: <Clock className="w-6 h-6 text-orange-500" />,
      title: "Class Scheduler",
      description: "Manage weekly timetables, batch assignments, and upcoming schedules with real-time sync."
    },
    {
      icon: <Award className="w-6 h-6 text-orange-500" />,
      title: "Automatic Portfolios",
      description: "Every student gets a public, customizable web portfolio highlighting certificates, feedback, and progress."
    },
     {
      icon: <Award className="w-6 h-6 text-orange-500" />,
      title: "Grow Your Academy",
      description: "Grow your academy with FLODECH LIVE WEBSITE of each academy which acts like academy's portfolio with 0% coding! Share the link of website and let future students experience professioanlism!"
    },
    {
      icon: <Sparkles className="w-6 h-6 text-orange-500" />,
      title: "Reports & Analytics",
      description: "Instantly create PDF summaries for individual student history, batch attendance logs, and financial collection records."
    }
  ];

  const benefits = [
    {
      metric: "90%",
      label: "Reduction in Admin Tasks",
      detail: "Spend your time teaching instead of chasing fees and messaging student parents."
    },
    {
      metric: "100%",
      label: "Fee Verification Rate",
      detail: "Direct UPI QR scans paired with instant teacher-side receipts leave no transaction unverified."
    },
    {
      metric: "10x",
      label: "Better Student Branding",
      detail: "Professional public portfolio links celebrate student milestones and win parent recommendations."
    }
  ];

  const testimonials = [
    {
      quote: "Flodech replaced three different apps for us. Our parents love the portfolios, and marking attendance takes 5 seconds now.",
      author: "Sneha Mehta",
      role: "Director, Pulse Dance Academy"
    },
    {
      quote: "No more scrolling WhatsApp groups searching for payment receipts. The UPI QR features and fee status boards are absolute lifesavers.",
      author: "Rajesh Kumar",
      role: "Lead Physicist, Zenith Coaching Center"
    },
    {
      quote: "The students feel incredibly motivated with their portfolio galleries. It highlights our academy as a truly technology-driven learning center.",
      author: "Liam Harrison",
      role: "Head of Music, Resonance Guitar Studio"
    }
  ];

  const faqs = [
    {
      question: "Is Flodech suitable for small tutoring academies or single teachers?",
      answer: "Absolutely! Flodech is optimized for educational organizations of all sizes—from solo tutors managing 10 students inside a home tuition center to large multi-batch music, dance, and training academies."
    },
    {
      question: "How do students log into their dashboards?",
      answer: "Teachers generate a unique Student ID (e.g. FLD-STU-X8P4K) and a starting password. Students can sign in using these credentials to get full, safe access to schedules, notices, reports, portfolios, and chat."
    },
    {
      question: "Does client data transfer securely with Firebase?",
      answer: "Yes, all data resides in secure cloud containers governed by rigorous Firebase Security Rules. Only authenticated students can download their records, and only verified teachers can view their academy data."
    },
    {
      question: "Can I print receipts and reports as PDFs?",
      answer: "Yes, Flodech includes a built-in Reports system. Teachers can download complete visual charts for attendance logs, student enrollment profiles, and payment histories instantly."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans tracking-tight flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Header - Hidden to avoid duplicate headers */}
      <header className="hidden">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={logoImg}
              alt="Flodech Logo"
              className="w-9 h-9 rounded-lg object-cover bg-orange-500 select-none shadow-sm"
              referrerPolicy="no-referrer"
            />
            <span id="logo-text" className="text-xl font-bold tracking-tight text-slate-950 font-sans">
              Flodech
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-orange-500 transition-colors">Features</a>
            <a href="#benefits" className="hover:text-orange-500 transition-colors">Benefits</a>
            <a href="#faq" className="hover:text-orange-500 transition-colors">FAQ</a>
          </nav>

          <button 
            id="header-cta-btn"
            onClick={onGetStarted}
            className="px-4 py-2 text-sm font-semibold text-white bg-slate-950 rounded-lg hover:bg-orange-500 transition-colors active:scale-95 duration-100 shadow-sm"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32 bg-white overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 bg-[radial-gradient(#f97316_0.15px,transparent_0.15px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative max-w-4xl mx-auto text-center flex flex-col items-center"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full text-xs font-semibold text-orange-600 mb-6 uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> All-In-One Academy Manager
          </motion.div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-950 leading-[1.1] mb-6 max-w-3xl min-h-[140px] sm:min-h-[180px] lg:min-h-[220px]">
            Everything for Your Academy in <br className="hidden sm:inline" />
            <TypewriterEffect />
          </h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg sm:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed"
          >
            Replace scattered WhatsApp groups, spreadsheets, paper books, and payment notes with a beautiful, professional, secure platform designed for coaching, dance, music, and educational academies.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
          >
            <button 
              id="hero-cta-btn"
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-orange-500/10 cursor-pointer"
            >
              Get Started for Free <ArrowRight className="w-5 h-5" />
            </button>
            <a 
              href="#features" 
              className="w-full sm:w-auto px-8 py-4 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-center"
            >
              Explore Features
            </a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-14 inline-flex items-center gap-4 text-slate-400 text-xs font-medium"
          >
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-orange-500" /> Fully Mobile Responsive</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-orange-500" /> Live Firestore Sync</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Comparison Hook Panel */}
      <section className="bg-slate-950 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-800 items-center justify-between gap-8">
          <div className="w-full p-4 text-center md:text-left">
            <span className="text-xs uppercase font-extrabold tracking-widest text-orange-500 block mb-2 font-mono">PROBLEM</span>
            <h3 className="text-lg font-bold text-slate-200 mb-1">Weekly Chaos</h3>
            <p className="text-slate-400 text-sm">Chasing clients, misinterpreting texts, lost excel records, paper logs getting wet or forgotten.</p>
          </div>
          <div className="w-full p-4 md:pl-8 text-center md:text-left">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-500 block mb-2 font-mono">SOLUTION</span>
            <h3 className="text-lg font-bold text-slate-200 mb-1">Standardized Platform</h3>
            <p className="text-slate-400 text-sm">Direct, fast data grids for schedules, fees, portfolios, chat channels, and attendance stats.</p>
          </div>
        </div>
      </section>

      {/* Academy Types Showcase Section */}
      <section className="py-24 px-6 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-orange-600 bg-orange-55 px-3 py-1 rounded-full uppercase tracking-wider">
              Tailored Solutions
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 mt-4 mb-4">
              Designed for Your Specific Academy
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Choose your style. Flodech automatically adapts its layout, terminology, and tools to match your exact domain.
            </p>
          </div>

          {/* Interactive Academy Switcher Component */}
          <AcademyShowcaseExplorer onGetStarted={onGetStarted} />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 mb-4">
              Everything Your Academy Needs
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Say goodbye to fragmented tools. Flodech bundles administration, records, communications, and branding into a cohesive dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all group duration-200 flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-6 group-hover:scale-115 transition-transform duration-200">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed flex-grow">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 px-6 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 mb-4">
              Designed To Transform Operations
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Run your tutoring coaching center like a professional SaaS. Experience instant workflow efficiencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {benefits.map((benefit, index) => (
              <div key={index} className="px-6 py-10 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-5xl lg:text-6xl font-extrabold text-orange-500 tracking-tight mb-2">
                  {benefit.metric}
                </div>
                <h4 className="text-lg font-bold text-slate-950 mb-3">{benefit.label}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{benefit.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 mb-3">
              Trusted by Premier Educators
            </h2>
            <p className="text-slate-600 text-sm">
              Here is what founders, teachers, and tutors say about Flodech.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <p className="text-slate-700 italic text-sm leading-relaxed mb-6">
                  "{t.quote}"
                </p>
                <div>
                  <div className="h-px bg-slate-100 mb-4" />
                  <h4 className="font-bold text-slate-950 text-sm">{t.author}</h4>
                  <p className="text-orange-500 text-xs font-medium">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingPage onSubscribe={onGetStarted} />

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-sm">
              Everything you need to know about setting up and running your Academy platform on Flodech.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-5 text-left font-bold text-slate-900 hover:bg-slate-50 flex items-center justify-between text-sm sm:text-base cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-orange-500 shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeFaq === index ? 'rotate-180 text-orange-500' : ''}`} />
                </button>
                
                {activeFaq === index && (
                  <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pre-Footer Action */}
      <section className="bg-slate-950 text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Ready to streamline your Academy?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed font-sans">
            Join premier schools, freelance trainers, and educational institutes worldwide who manage everything under one centralized portal.
          </p>
          <button 
            id="bottom-cta-btn"
            onClick={onGetStarted}
            className="px-8 py-4 text-base font-bold text-slate-950 bg-white rounded-xl hover:bg-orange-500 hover:text-white transition-colors duration-150 shadow-lg cursor-pointer"
          >
            Get Started Instantly
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 px-6 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img 
              src={logoImg} 
              alt="Flodech Logo" 
              className="w-8 h-8 object-cover rounded-md bg-white p-0.5 select-none" 
            />
            <span className="text-white font-bold text-lg tracking-tight">Flodech</span>
          </div>
          
          <p className="text-xs text-slate-500 text-center">
            &copy; {new Date().getFullYear()} Flodech Academy Inc. All rights reserved. "Everything for Your Academy in One Place."
          </p>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AcademyShowcaseExplorer({ onGetStarted }: { onGetStarted: () => void }) {
  const [activeTab, setActiveTab] = useState<'coaching' | 'music' | 'dance'>('coaching');

  const content = {
    coaching: {
      title: "Coaching & Tuition Centers",
      bio: "The ultimate hub for tuition centers, coaching academies, test preparation classes, and independent teachers. Seamlessly handle student groups, record timetables and schedules, grade homework with precision, and keep parents updated at every step without extra effort.",
      features: [
        {
          title: "Structured Homework",
          desc: "Manage and assign worksheets, set submission due dates, and track student answers or document uploads instantly."
        },
        {
          title: "Progress Reporting & Grades",
          desc: "Log scores, evaluate performance, and send direct feedback metrics so parents always know how their children are doing."
        },
        {
          title: "Announcements & Notices",
          desc: "Publish exam schedules, syllabus guidelines, and vacation updates instantly right onto student dashboards."
        }
      ],
      benefits: [
        {
          title: "Save 10+ Hours/Week",
          desc: "No more tracking down missing homework sheets or sorting through infinite messaging group histories."
        },
        {
          title: "Zero Miscommunications",
          desc: "Clear visual timelines keep classroom schedules, assignments, and test updates direct and transparent."
        },
        {
          title: "Painless Fee Collection",
          desc: "Highlight pending tuition amounts and allow swift invoice tracking directly inside student portals."
        }
      ]
    },
    music: {
      title: "Music Academies & Conservatories",
      bio: "Crafted specifically for private music teachers, instrumental learning groups, voice coaches, and bands. Organize lesson categories, keep records of schedules, share music sheets, and manage practice expectations effortlessly.",
      features: [
        {
          title: "Instrument & Practice Logs",
          desc: "Set lessons for music training, monitor homework practice logs, and provide specific guidance per instrument."
        },
        {
          title: "Real-time Sheet & Audio Sharing",
          desc: "Use the built-in communication system to share notes, tabs, audio recordings, or syllabus plans securely."
        },
        {
          title: "Beautiful Performance Portfolios",
          desc: "Highlight music milestones, event recordings, and certification badges on a public profile page parents will love."
        }
      ],
      benefits: [
        {
          title: "Increased Student Motivation",
          desc: "Interactive profiles and structured lessons encourage consistent practice between weekly sessions."
        },
        {
          title: "All Materials in One Place",
          desc: "Forget printed books and lost reference tracks. Digital uploads keep reference material accessible forever."
        },
        {
          title: "Stand Out Professionally",
          desc: "Impress prospective families by presenting a highly modern, tech-enabled conservatory platform."
        }
      ]
    },
    dance: {
      title: "Dance Studios & Choreography Teams",
      bio: "Designed for modern dance studios, ballet troupes, hip-hop crews, and ensemble instructors. Effortlessly monitor attendance, track student training milestones, broadcast recital details, and simplify choreographic scheduling.",
      features: [
        {
          title: "Schedules & Rehearsals",
          desc: "Publish calendars for masterclasses, troupe workshops, and upcoming recital rehearsal timetables."
        },
        {
          title: "Event & Recital Alerts",
          desc: "Share show locations, stage guidelines, performance dress codes, and rules under structured announcements."
        },
        {
          title: "Dancer Portfolios",
          desc: "Build professional pages showcasing certification certificates, rehearsal videos, and performance feedback."
        }
      ],
      benefits: [
        {
          title: "Flawless Training Attendance",
          desc: "Track exact dancer check-ins across intense choreography sessions with interactive class dashboards."
        },
        {
          title: "Faster Recital Coordination",
          desc: "Distribute costume guidelines, timing notes, and performance directions in a single centralized space."
        },
        {
          title: "Simplify Fee Handling",
          desc: "Request outstanding tuition or team payments with easy custom receipts and invoices."
        }
      ]
    }
  };

  const selected = content[activeTab];

  return (
    <div id="academy-explorer" className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-sm space-y-8 font-sans">
      {/* Switcher tabs */}
      <div className="flex flex-wrap gap-2 justify-center border-b border-slate-200 pb-6">
        <button
          onClick={() => setActiveTab('coaching')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all cursor-pointer ${
            activeTab === 'coaching'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Coaching & Tuition
        </button>
        <button
          onClick={() => setActiveTab('music')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all cursor-pointer ${
            activeTab === 'music'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Music className="w-4 h-4" /> Music Academy
        </button>
        <button
          onClick={() => setActiveTab('dance')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all cursor-pointer ${
            activeTab === 'dance'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Dance Academy
        </button>
      </div>

      {/* Main active tab presentation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 pt-4"
        >
          {/* Bio on Left */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-slate-950 flex items-center gap-2.5">
                {activeTab === 'coaching' && <BookOpen className="w-6 h-6 text-orange-500" />}
                {activeTab === 'music' && <Music className="w-6 h-6 text-orange-500" />}
                {activeTab === 'dance' && <Sparkles className="w-6 h-6 text-orange-500" />}
                {selected.title}
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                {selected.bio}
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-100/50 rounded-2xl p-5 space-y-3.5">
              <h4 className="text-xs uppercase tracking-wider font-extrabold text-orange-600 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-4 h-4 text-orange-500" /> Key Benefits & Impact
              </h4>
              <div className="space-y-3">
                {selected.benefits.map((b, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start">
                    <div className="w-5 h-5 rounded bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-orange-600" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{b.title}</h5>
                      <p className="text-[11px] text-slate-500 leading-normal">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features on Right */}
          <div className="lg:col-span-7 space-y-6">
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block font-mono">
              Highlighted Core Features
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
              {selected.features.map((f, idx) => (
                <div 
                  key={idx} 
                  className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-2xs hover:border-orange-200 hover:shadow-xs transition-all flex gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-orange-500 font-bold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-950 mb-1">{f.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 text-right">
              <button
                onClick={onGetStarted}
                className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-slate-950 rounded-xl hover:bg-orange-500 transition-colors cursor-pointer flex inline-flex items-center gap-2"
              >
                Set Up Your Academy <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
