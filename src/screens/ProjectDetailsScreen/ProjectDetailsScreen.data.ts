/** Progress options offered in the "update progress" sheet (percent). */
export const PROGRESS_STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

/** Project details copy. */
export const projectDetailsCopy = {
  title: 'تفاصيل المشروع',
  notFound: 'المشروع غير موجود',
  back: 'رجوع',
  emptyValue: '—',
  unknownUser: 'مستخدم',

  // Header
  eyebrow: (code: string, committee: string) => `${code} • ${committee}`,
  milestonesSummary: (done: string, total: string, endDate: string) => `${done} من ${total} مراحل منجزة • ينتهي ${endDate}`,

  // Manager actions
  updateProgress: 'تحديث التقدم',
  edit: 'تعديل',
  closeAsCompleted: 'إغلاق كمكتمل',

  // Info card
  descriptionTitle: 'وصف المشروع',
  noDescription: 'لا يوجد وصف.',
  committee: 'اللجنة',
  startDate: 'تاريخ البدء',
  endDate: 'تاريخ الانتهاء',
  lead: 'مسؤول المشروع',
  team: 'فريق العمل',

  // Toasts
  progressSaved: 'تم تحديث تقدم المشروع بنجاح',
  milestoneRequired: 'يرجى إدخال اسم المرحلة',
  milestoneAdded: 'تمت إضافة المرحلة بنجاح',
  budgetSaved: 'تم تحديث الميزانية',
  projectClosed: 'تم إغلاق المشروع كمكتمل بنجاح',
  commentSent: 'تم إرسال الملاحظة بنجاح',

  // Budget prompt
  budgetPrompt: {
    title: 'الميزانية المخصصة',
    message: 'أدخل الميزانية المخصصة للمشروع بالجنيه.',
    placeholder: 'مثال: 250000',
    confirmLabel: 'حفظ',
    requiredMessage: 'يرجى إدخال المبلغ',
  },

  // Close confirmation
  closeConfirm: {
    title: 'إغلاق المشروع كمكتمل؟',
    message: 'سيتم اعتبار جميع المراحل منجزة وتحديث نسبة الإنجاز إلى 100%.',
    confirmLabel: 'إغلاق المشروع',
  },

  // Milestones
  milestonesTitle: 'المراحل الرئيسية',
  addMilestone: 'إضافة مرحلة',
  unmarkMilestoneA11y: (title: string) => `إلغاء إنجاز ${title}`,
  markMilestoneA11y: (title: string) => `تحديد ${title} كمنجزة`,
  milestoneDue: (date: string) => `الموعد: ${date}`,
  milestoneDone: 'منجزة',
  milestoneLate: 'متأخرة',
  noMilestones: 'لم تُضف مراحل بعد',
  milestonesHint: 'اضغط على المرحلة لتحديدها كمنجزة — يتم تحديث نسبة الإنجاز تلقائياً.',

  // Add milestone sheet
  milestoneSheetTitle: 'إضافة مرحلة جديدة',
  milestoneSubmit: 'إضافة المرحلة',
  milestoneName: 'اسم المرحلة',
  milestoneNamePlaceholder: 'مثال: الإطلاق التجريبي',
  milestoneDate: 'موعد المرحلة',
  milestoneDateHint: 'إذا لم تحدد موعداً سيُستخدم تاريخ انتهاء المشروع',

  // Comments
  commentsTitle: 'الملاحظات الإدارية',
  noComments: 'لا توجد ملاحظات بعد',
  noCommentsMessage: 'يمكن لأعضاء المشروع والمسؤول تبادل الملاحظات الإدارية هنا.',
  replyingTo: (name: string, message: string) => `رد على ${name}: ${message}`,
  cancelReply: 'إلغاء الرد',
  commentsDisabled: 'الملاحظات متاحة لأعضاء اللجنة وفريق المشروع فقط',
  replyPlaceholder: 'اكتب ردك…',
  commentPlaceholder: 'أضف ملاحظة إدارية على المشروع…',
  you: 'أنت',
  unknownInitial: '؟',
  commentMeta: (role: string, when: string) => `${role} • ${when}`,
  reply: 'رد',

  // Progress sheet
  progressSheetTitle: 'تحديث تقدم المشروع',
  saveProgress: 'حفظ التحديث',
  progressLabel: (percent: string) => `نسبة الإنجاز: ${percent}`,
  stepA11y: (step: number) => `${step}%`,
  statusLabel: 'حالة المشروع',

  // Finance
  financeTitle: 'الموقف المالي',
  editBudget: 'تعديل الميزانية',
  setBudget: 'تحديد الميزانية',
  budget: 'الميزانية',
  spent: 'المصروف',
  remaining: 'المتبقي',
  overBudget: (percent: string) => `تجاوز الميزانية بنسبة ${percent}`,
  spendRate: (percent: string) => `نسبة الصرف ${percent}`,
  expenseLabel: (label: string, date: string) => `${label} • ${date}`,
  noBudget: 'لم تُخصص ميزانية لهذا المشروع بعد.',
} as const;
