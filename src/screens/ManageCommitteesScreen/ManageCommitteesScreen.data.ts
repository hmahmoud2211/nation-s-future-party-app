/** Committee management (admin) copy. */
export const manageCommitteesCopy = {
  title: 'إدارة اللجان',
  subtitle: (enabled: number, total: number) => `${enabled} لجنة مفعّلة من ${total}`,
  addCommitteeA11y: 'إضافة لجنة',

  unauthorizedTitle: 'غير مصرح',
  unauthorizedMessage: 'إدارة اللجان متاحة لمدير النظام فقط.',

  // Committee row
  enabled: 'مفعّلة',
  disabled: 'معطلة',
  showInDirectory: 'إظهار اللجنة في الدليل',
  officialsLabel: 'مسؤولو اللجنة',
  officialsHint: 'يمكن تعيين أكثر من مسؤول للجنة الواحدة',
  officialsPlaceholder: 'تعيين مسؤولين',
  officialsTitle: (shortName: string) => `مسؤولو ${shortName}`,
  currentOfficial: (roles: string) => `مسؤول حالي • ${roles}`,
  committeeMember: 'عضو في اللجنة',
  outsideCommittee: 'من خارج اللجنة',

  disableConfirmTitle: 'تعطيل اللجنة؟',
  disableConfirmMessage: 'ستظهر اللجنة كمعطلة في الدليل. يمكن إعادة تفعيلها في أي وقت.',
  disableConfirmLabel: 'تعطيل',
  enabledToast: 'تم تفعيل اللجنة',
  disabledToast: 'تم تعطيل اللجنة',

  namesSeparator: '، ',
  addedLine: (names: string) => `إضافة: ${names}`,
  removedLine: (names: string) => `إزالة: ${names}`,
  assignConfirmTitle: 'تحديث مسؤولي اللجنة',
  assignConfirmMessage: (lines: string, committeeName: string) =>
    `${lines}\n\nتُمنح صلاحيات إدارة ${committeeName} لكل المسؤولين المختارين، مع احتفاظ كل منهم بأدواره الأخرى (محاكاة).`,
  assignConfirmLabel: 'حفظ',
  assignSuccess: 'تم تحديث مسؤولي اللجنة',

  // New committee sheet
  newCommittee: 'إضافة لجنة جديدة',
  saveCommittee: 'حفظ اللجنة',
  nameRequired: 'يرجى إدخال اسم اللجنة',
  incompleteForm: 'يرجى استكمال البيانات المطلوبة',
  createSuccess: 'تمت إضافة اللجنة بنجاح',
  nameLabel: 'اسم اللجنة',
  namePlaceholder: 'مثال: لجنة الصادرات',
  shortNameLabel: 'الاسم المختصر',
  shortNamePlaceholder: 'مثال: الصادرات',
  descriptionLabel: 'الوصف',
  descriptionPlaceholder: 'نبذة عن مهام اللجنة…',
  iconLabel: 'الأيقونة',
  colorLabel: 'اللون',
  chooseColorA11y: 'اختيار اللون',
  previewName: 'معاينة اللجنة',
} as const;

/** Identity colours offered by the committee colour picker, in order (keys of `theme.identityColors`). */
export const committeeColorKeys = ['navy', 'indigo', 'forest', 'plum', 'amber', 'ocean', 'bronze', 'green'] as const;
