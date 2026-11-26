/** Member profile copy. */
export const memberDetailsCopy = {
  title: 'بيانات العضو',
  selfTitle: 'بياناتي',
  notFoundTitle: 'العضو غير موجود',
  back: 'العودة',
  editA11y: 'تعديل البيانات والدور',

  noteDialogTitle: 'إرسال ملاحظة إدارية',
  noteDialogMessage: (name: string) => `ستصل الملاحظة إلى ${name} كإشعار داخل التطبيق.`,
  notePlaceholder: 'اكتب الملاحظة الإدارية…',
  noteConfirm: 'إرسال',
  noteRequired: 'يرجى كتابة نص الملاحظة',
  noteNotificationTitle: 'ملاحظة إدارية',
  noteSent: 'تم إرسال الملاحظة بنجاح',
  sendNote: 'إرسال ملاحظة إدارية',

  committeeOfficial: 'مسؤول اللجنة',
  committeeSupervision: 'إشراف',
  roleSeparator: ' • ',

  committeesTitle: 'اللجان',
  followsAllCommittees: 'يتابع جميع لجان الأمانة',
  noCommittees: 'غير مسجل في أي لجنة',
  governoratesTitle: 'المحافظات المسندة',

  membershipTitle: 'بيانات العضوية',
  rolesLabel: 'الصفة',
  rolesSeparator: '، ',
  statusLabel: 'حالة العضوية',
  joinDateLabel: 'تاريخ الانضمام',
  membershipNumberLabel: 'رقم العضوية',
  phoneLabel: 'الهاتف (افتراضي)',
  emailLabel: 'البريد الإلكتروني',

  proposalsTitle: 'المقترحات المقدمة',
  projectsTitle: 'المشروعات',
} as const;
