import {
  BookOpen,
  Building2,
  ChartCandlestick,
  Cpu,
  Factory,
  HeartHandshake,
  Leaf,
  Lightbulb,
  Plane,
  Ship,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react-native';
import type { CommitteeIconKey } from '@/features/committees/types';

export const COMMITTEE_ICONS: Record<CommitteeIconKey, LucideIcon> = {
  investment: TrendingUp,
  industry: Factory,
  realestate: Building2,
  entrepreneurship: Lightbulb,
  trade: Ship,
  tourism: Plane,
  technology: Cpu,
  energy: Leaf,
  social: HeartHandshake,
  studies: BookOpen,
  markets: ChartCandlestick,
};

export const COMMITTEE_ICON_LABELS: Record<CommitteeIconKey, string> = {
  investment: 'استثمار',
  industry: 'صناعة',
  realestate: 'عقارات',
  entrepreneurship: 'ابتكار',
  trade: 'تجارة',
  tourism: 'سياحة',
  technology: 'تكنولوجيا',
  energy: 'طاقة',
  social: 'مجتمع',
  studies: 'دراسات',
  markets: 'أسواق',
};
