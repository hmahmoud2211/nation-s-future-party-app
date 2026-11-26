/** Small pure helpers for lists and numbers. */
export function replaceById<T extends { id: string }>(list: T[], id: string, updater: (item: T) => T): T[] {
  return list.map((item) => (item.id === id ? updater(item) : item));
}
export const clampProgress = (p: number) => Math.max(0, Math.min(100, Math.round(p)));

export const sortByDateDesc = <T extends { createdAt: string }>(list: T[]) =>
  [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
