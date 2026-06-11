export const CoachingFeaturesConfig = {
  academyType: 'Coaching / Tuition' as const,
  labels: {
    studentSingular: 'Student',
    studentPlural: 'Students',
    batchSingular: 'Batch',
    batchPlural: 'Batches',
    subjectSingular: 'Subject',
    subjectPlural: 'Subjects',
    teacherSingular: 'Teacher',
    teacherPlural: 'Teachers',
    testSingular: 'Test',
    testPlural: 'Tests',
    homeworkSingular: 'Homework',
    homeworkPlural: 'Homeworks',
  },
  placeholders: {
    studentName: 'e.g. John Doe',
    studentBatchEnroll: 'Select Academic Batch',
    batchName: 'e.g. Batch Delta (Class 10)',
    subjectName: 'e.g. Physics / Chemistry',
    attendanceBatch: 'Select Student Batch',
  },
  customFields: {
    showParentPhone: true,
    showAcademicLevel: true,
    showSkillLevel: false,
    showDanceStyle: false,
    showInstrumentCategory: false,
  },
  theme: {
    accentColor: 'orange-500',
    accentText: 'text-orange-500',
    accentBg: 'bg-orange-500',
    sidebarBg: 'bg-slate-900',
  }
};
