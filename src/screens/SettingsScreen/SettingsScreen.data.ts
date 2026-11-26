/** Admin settings copy. */
export const settingsCopy = {
  title: 'الإعدادات',
  subtitle: 'إعدادات العرض والبيانات التجريبية',

  unauthorizedTitle: 'غير مصرح',
  unauthorizedMessage: 'إعدادات النظام متاحة لمدير النظام فقط.',

  resetConfirmTitle: 'إعادة تعيين جميع البيانات؟',
  resetConfirmMessage: 'سيتم حذف كل التغييرات والعودة للبيانات التجريبية الأولية. لا يمكن التراجع.',
  resetConfirmLabel: 'إعادة التعيين',
  resetSuccess: 'تمت إعادة تعيين البيانات التجريبية',

  permissionsTitle: 'الصلاحيات',
  permissionsRuleTitle: 'مصفوفة صلاحيات مركزية',
  permissionsRuleBody:
    'الأمين يرى كل اللجان والبيانات المالية ويبت في المقترحات. الأمين المساعد يتابع المحافظات المسندة إليه. مسؤول اللجنة صلاحية تُضاف لأي شخص لتقديم مقترحات لجنته وإدارة أنشطتها.',

  displayTitle: 'العرض',
  demoHintsLabel: 'إظهار تنبيهات النسخة التجريبية',
  demoHintsDescription: 'عرض ملاحظات توضح أن الإجراءات محاكاة وأن البيانات وهمية',
  demoHintsShown: 'تم إظهار التنبيهات التجريبية',
  demoHintsHidden: 'تم إخفاء التنبيهات التجريبية',

  demoDataTitle: 'البيانات التجريبية',
  resetButton: 'إعادة تعيين جميع البيانات',
  demoNotice: 'الصلاحيات في هذه النسخة محاكاة على الواجهة فقط وليست حماية أمنية حقيقية.',
} as const;
