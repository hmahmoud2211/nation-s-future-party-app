/** Display labels and badge tones for the requests domain. */
import type { RequestStatus, RequestType } from '@/features/requests/types';

import type { LabelTone } from '@/types/common.types';

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
