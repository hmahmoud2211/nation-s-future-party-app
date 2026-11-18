let counter = 0;

/** Session-unique id generator (no crypto dependency needed for a demo). */
export function uid(prefix = 'id'): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export const nowISO = () => new Date().toISOString();
