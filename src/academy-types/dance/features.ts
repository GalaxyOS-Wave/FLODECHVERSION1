export const DanceFeaturesConfig = {
  academyType: 'Dance Academy' as const,
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
    studentName: 'e.g. Isabella Smith',
    studentBatchEnroll: 'Select Student Batch',
    batchName: 'e.g. Batch Delta (Class 10)',
    subjectName: 'e.g. Contemporary / Hip Hop routine',
    attendanceBatch: 'Select Student Batch',
  },
  customFields: {
    showParentPhone: true,
    showAcademicLevel: false,
    showSkillLevel: true,
    showDanceStyle: true,
    showInstrumentCategory: false,
  },
  theme: {
    accentColor: 'pink-600',
    accentText: 'text-pink-600',
    accentBg: 'bg-pink-600',
    sidebarBg: 'bg-slate-950',
  }
};
