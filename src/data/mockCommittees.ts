import type { Committee } from '@/features/committees/types';
import { identityColors } from '@/theme';
import { daysAgo } from '@/utils/dates';

/**
 * The 10 committees (activities) of أمانة قطاع الأعمال المركزية, in the order of the official chart.
 * Descriptions are the "main tasks" (المهام الرئيسية) from that chart.
 * Officials and supervisors are derived from members — see mockMembers.ts.
 * Admins can enable/disable entries at runtime.
 */
export const mockCommittees: Committee[] = [
  {
    id: 'c-investment',
    name: 'لجنة الاستثمار',
    shortName: 'الاستثمار',
    description: 'تحفيز الاستثمار المحلي والأجنبي ووضع المبادرات الاستثمارية.',
    icon: 'investment',
    color: identityColors.navy,
    enabled: true,
    createdAt: daysAgo(720),
  },
  {
    id: 'c-industry',
    name: 'لجنة الصناعة',
    shortName: 'الصناعة',
    description: 'دعم القطاع الصناعي وتطويره ومعالجة التحديات.',
    icon: 'industry',
    color: identityColors.bronze,
    enabled: true,
    createdAt: daysAgo(700),
  },
  {
    id: 'c-realestate',
    name: 'لجنة التطوير العقاري',
    shortName: 'التطوير العقاري',
    description: 'دعم التطوير العقاري والمدن الجديدة وتوفير الحلول التشريعية.',
    icon: 'realestate',
    color: identityColors.forest,
    enabled: true,
    createdAt: daysAgo(690),
  },
  {
    id: 'c-entre',
    name: 'لجنة ريادة الأعمال والابتكار',
    shortName: 'ريادة الأعمال',
    description: 'دعم الشركات الناشئة والابتكار ونشر ثقافة ريادة الأعمال.',
    icon: 'entrepreneurship',
    color: identityColors.amber,
    enabled: true,
    createdAt: daysAgo(650),
  },
  {
    id: 'c-trade',
    name: 'لجنة التجارة الداخلية والخارجية',
    shortName: 'التجارة',
    description: 'دعم حركة التجارة الداخلية والخارجية وتسهيل الإجراءات.',
    icon: 'trade',
    color: identityColors.ocean,
    enabled: true,
    createdAt: daysAgo(640),
  },
  {
    id: 'c-tourism',
    name: 'لجنة السياحة والضيافة',
    shortName: 'السياحة',
    description: 'تعزيز السياحة ودعم قطاع الضيافة وتطوير الخدمات.',
    icon: 'tourism',
    color: identityColors.teal,
    enabled: true,
    createdAt: daysAgo(600),
  },
  {
    id: 'c-tech',
    name: 'لجنة التكنولوجيا والتحول الرقمي',
    shortName: 'التكنولوجيا',
    description: 'دعم التحول الرقمي وتبني التكنولوجيا الحديثة.',
    icon: 'technology',
    color: identityColors.indigo,
    enabled: true,
    createdAt: daysAgo(710),
  },
  {
    id: 'c-social',
    name: 'لجنة المسؤولية المجتمعية',
    shortName: 'المسؤولية المجتمعية',
    description: 'تعزيز دور القطاع الخاص في خدمة المجتمع والمبادرات المجتمعية.',
    icon: 'social',
    color: identityColors.plum,
    enabled: true,
    createdAt: daysAgo(540),
  },
  {
    id: 'c-studies',
    name: 'لجنة الدراسات والسياسات الاقتصادية',
    shortName: 'الدراسات',
    description: 'إعداد الدراسات والبحوث الاقتصادية وصياغة السياسات والمقترحات.',
    icon: 'studies',
    color: identityColors.slate,
    enabled: true,
    createdAt: daysAgo(520),
  },
  {
    id: 'c-markets',
    name: 'لجنة الأسواق المالية',
    shortName: 'الأسواق المالية',
    description: 'دعم وتطوير الأسواق المالية وتعزيز دورها في الاقتصاد.',
    icon: 'markets',
    color: identityColors.olive,
    enabled: true,
    createdAt: daysAgo(500),
  },
];
