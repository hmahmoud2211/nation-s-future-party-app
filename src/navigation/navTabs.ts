import { CalendarDays, House, LayoutGrid, Lightbulb, Menu, type LucideIcon } from 'lucide-react-native';

export interface TabDef {
  /** Route name inside `app/(tabs)/`. */
  name: string;
  label: string;
  icon: LucideIcon;
}

/**
 * The same five tabs for every role (first item = right-most in RTL). What each tab shows
 * depends on the user's permissions; role-specific tools (finance, governorates, admin) live in «المزيد».
 */
export const TABS: TabDef[] = [
  { name: 'home', label: 'الرئيسية', icon: House },
  { name: 'committees', label: 'اللجان', icon: LayoutGrid },
  { name: 'proposals', label: 'المقترحات', icon: Lightbulb },
  { name: 'meetings', label: 'الاجتماعات', icon: CalendarDays },
  { name: 'more', label: 'المزيد', icon: Menu },
];
