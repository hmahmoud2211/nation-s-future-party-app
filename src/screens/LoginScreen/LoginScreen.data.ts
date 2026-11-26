/** Login page copy. */
export const loginCopy = {
  brandTitle: 'مستقبل وطن | قطاع الأعمال',
  brandSubtitle: 'أمانة قطاع الأعمال المركزية',
  intro: 'مرحباً بك في منصة إدارة اللجان والمقترحات والاجتماعات. سجّل الدخول للمتابعة.',

  formTitle: 'تسجيل الدخول',
  phoneLabel: 'رقم الهاتف',
  phonePlaceholder: '01xxxxxxxxx',
  passwordLabel: 'كلمة المرور',
  passwordPlaceholder: '••••••',
  hidePassword: 'إخفاء كلمة المرور',
  showPassword: 'إظهار كلمة المرور',
  submit: 'دخول',
  demoNotice: 'دخول تجريبي — لا يوجد تحقق حقيقي أو خادم. كلمة المرور لجميع الحسابات: 123456',

  demoAccountsTitle: 'الحسابات التجريبية',
  accountGroupTitle: (label: string, count: number) => `${label} (${count})`,
  loginAs: (name: string) => `دخول كـ ${name}`,

  phoneRequired: 'يرجى إدخال رقم الهاتف',
  phoneInvalid: 'رقم الهاتف يجب أن يتكون من 11 رقماً ويبدأ بـ 01',
  passwordRequired: 'يرجى إدخال كلمة المرور',
  passwordTooShort: 'كلمة المرور 6 أحرف على الأقل',

  welcome: (firstName: string) => `مرحباً، ${firstName}`,
  formIncomplete: 'يرجى استكمال البيانات المطلوبة',
} as const;
