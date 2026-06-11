export const MusicFeaturesConfig = {
  academyType: 'Music Academy' as const,
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
    studentName: 'e.g. Liam Johnson',
    studentBatchEnroll: 'Select Student Batch',
    batchName: 'e.g. Batch Delta (Class 10)',
    subjectName: 'e.g. Acoustic Guitar / Violin Class',
    attendanceBatch: 'Select Student Batch',
  },
  customFields: {
    showParentPhone: true,
    showAcademicLevel: false,
    showSkillLevel: true,
    showDanceStyle: false,
    showInstrumentCategory: true,
  },
  theme: {
    accentColor: 'violet-600',
    accentText: 'text-violet-600',
    accentBg: 'bg-violet-600',
    sidebarBg: 'bg-zinc-950',
  }
};
