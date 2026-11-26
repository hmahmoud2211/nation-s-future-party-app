export interface AppSettings {
  /** Show the "demo mode" banner and simulated-action hints. */
  showDemoHints: boolean;
}

// ───────────── Store slice ─────────────

export interface SettingsSlice {
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetMockData: () => void;
}
