import type { Tone } from '@/theme';
import type {
  ActivityStatus,
  ActivityType,
  AnnouncementCategory,
  AnnouncementPriority,
  FeedbackStatus,
  FeedbackTopic,
  MeetingStatus,
  MembershipStatus,
  NotificationType,
  ProjectStatus,
  ProposalStatus,
  ReportStatus,
  RequestStatus,
  RequestType,
  Role,
  RSVPStatus,
} from '@/types';

type LabelTone = { label: string; tone: Tone };

export const ROLE_LABELS: Record<Role, string> = {
  member: 'عضو',
  board_member: 'عضو الهيئة',
  assistant_secretary: 'الأمين المساعد',
  sector_secretary: 'الأمين',
  admin: 'مدير النظام',
};

export const ROLE_TONES: Record<Role, Tone> = {
  member: 'neutral',
  board_member: 'info',
  assistant_secretary: 'purple',
  sector_secretary: 'navy',
  admin: 'error',
};

/** Badge for the committee-responsibility permission (مسؤول اللجنة). */
export const RESPONSIBLE_LABEL = 'مسؤول اللجنة';
export const RESPONSIBLE_TONE: Tone = 'gold';

export const MEMBERSHIP_STATUS: Record<MembershipStatus, LabelTone> = {
  active: { label: 'عضوية سارية', tone: 'success' },
  inactive: { label: 'غير نشط', tone: 'neutral' },
  suspended: { label: 'موقوفة مؤقتاً', tone: 'warning' },
};

export const PROJECT_STATUS: Record<ProjectStatus, LabelTone> = {
  planned: { label: 'مخطط له', tone: 'info' },
  in_progress: { label: 'قيد التنفيذ', tone: 'navy' },
  paused: { label: 'متوقف مؤقتاً', tone: 'warning' },
  completed: { label: 'مكتمل', tone: 'success' },
};

export const FEEDBACK_STATUS: Record<FeedbackStatus, LabelTone> = {
  new: { label: 'جديد', tone: 'info' },
  under_review: { label: 'قيد المراجعة', tone: 'warning' },
  replied: { label: 'تم الرد', tone: 'success' },
  closed: { label: 'مغلق', tone: 'neutral' },
};

export const FEEDBACK_TOPIC: Record<FeedbackTopic, string> = {
  proposal_note: 'ملاحظة على مقترح',
  project_note: 'ملاحظة على مشروع',
  review_request: 'طلب مراجعة',
  data_error: 'خطأ في البيانات',
  other: 'ملاحظة أخرى',
};

export const PROPOSAL_STATUS: Record<ProposalStatus, LabelTone> = {
  new: { label: 'جديد', tone: 'info' },
  under_review: { label: 'قيد المراجعة', tone: 'warning' },
  approved: { label: 'تمت الموافقة', tone: 'success' },
  rejected: { label: 'مرفوض', tone: 'error' },
  in_progress: { label: 'قيد التنفيذ', tone: 'navy' },
  completed: { label: 'مكتمل', tone: 'purple' },
};

/** Button labels for moving a proposal to a status. */
export const PROPOSAL_ACTION: Record<ProposalStatus, string> = {
  new: 'إعادة فتح',
  under_review: 'بدء المراجعة',
  approved: 'الموافقة',
  rejected: 'رفض',
  in_progress: 'بدء التنفيذ',
  completed: 'تم الإنجاز',
};

export const MEETING_STATUS: Record<MeetingStatus, LabelTone> = {
  scheduled: { label: 'مجدول', tone: 'info' },
  live: { label: 'جارٍ الآن', tone: 'success' },
  completed: { label: 'منعقد', tone: 'success' },
  cancelled: { label: 'ملغي', tone: 'error' },
};

export const RSVP_STATUS: Record<RSVPStatus, LabelTone> = {
  going: { label: 'تم تأكيد الحضور', tone: 'success' },
  declined: { label: 'اعتذر عن الحضور', tone: 'error' },
  pending: { label: 'بانتظار الرد', tone: 'neutral' },
};

export const ACTIVITY_TYPE: Record<ActivityType, string> = {
  workshop: 'ورشة عمل',
  forum: 'منتدى',
  visit: 'زيارة ميدانية',
  initiative: 'مبادرة',
  seminar: 'ندوة',
  training: 'برنامج تدريبي',
};

export const ACTIVITY_STATUS: Record<ActivityStatus, LabelTone> = {
  upcoming: { label: 'قادم', tone: 'info' },
  ongoing: { label: 'جارٍ', tone: 'warning' },
  completed: { label: 'منتهٍ', tone: 'success' },
};

export const ANNOUNCEMENT_PRIORITY: Record<AnnouncementPriority, LabelTone> = {
  normal: { label: 'عادي', tone: 'neutral' },
  important: { label: 'مهم', tone: 'warning' },
  urgent: { label: 'عاجل', tone: 'error' },
};

export const ANNOUNCEMENT_CATEGORY: Record<AnnouncementCategory, string> = {
  general: 'عام',
  meeting: 'اجتماعات',
  event: 'فعاليات',
  administrative: 'إداري',
};

export const REQUEST_TYPE: Record<RequestType, string> = {
  data_update: 'طلب تحديث بيانات',
  admin_inquiry: 'استفسار إداري',
  document: 'طلب مستند',
  tech_support: 'دعم فني',
};

export const REQUEST_STATUS: Record<RequestStatus, LabelTone> = {
  new: { label: 'جديد', tone: 'info' },
  under_review: { label: 'قيد المراجعة', tone: 'warning' },
  info_requested: { label: 'مطلوب معلومات إضافية', tone: 'purple' },
  resolved: { label: 'تم الحل', tone: 'success' },
  closed: { label: 'مغلق', tone: 'neutral' },
};

export const REPORT_STATUS: Record<ReportStatus, LabelTone> = {
  submitted: { label: 'مُقدَّم', tone: 'info' },
  reviewed: { label: 'تمت المراجعة', tone: 'success' },
};

export const NOTIFICATION_TYPE: Record<NotificationType, { label: string; tone: Tone }> = {
  proposal_new: { label: 'مقترح جديد', tone: 'gold' },
  proposal_update: { label: 'تحديث مقترح', tone: 'navy' },
  feedback_new: { label: 'ملاحظة جديدة', tone: 'purple' },
  feedback_reply: { label: 'رد على استفسار', tone: 'success' },
  meeting_new: { label: 'اجتماع', tone: 'info' },
  meeting_started: { label: 'اجتماع بدأ الآن', tone: 'success' },
  announcement_new: { label: 'إعلان جديد', tone: 'gold' },
  project_update: { label: 'تحديث مشروع', tone: 'navy' },
  request_update: { label: 'تحديث طلب إداري', tone: 'purple' },
};

export const CURRENCY = 'جنيه مصري';
export const CURRENCY_SHORT = 'ج.م';
