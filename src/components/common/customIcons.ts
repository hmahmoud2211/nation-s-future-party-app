import { createLucideIcon } from 'lucide-react-native';

/** Calendar with a four-point sparkle — the «الفعاليات» tile glyph from the design (Lucide has no equivalent). */
export const CalendarSparkle = createLucideIcon('calendar-sparkle', [
  ['path', { d: 'M8 2v3', key: 'cs-1' }],
  ['path', { d: 'M16 2v3', key: 'cs-2' }],
  ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', key: 'cs-3' }],
  ['path', { d: 'M3 9h18', key: 'cs-4' }],
  ['path', { d: 'M12 11.5l1.1 2.9 2.9 1.1-2.9 1.1-1.1 2.9-1.1-2.9-2.9-1.1 2.9-1.1z', key: 'cs-5' }],
]);
