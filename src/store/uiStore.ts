import { create } from 'zustand';

export type ToastTone = 'success' | 'error' | 'info' | 'warning';

export interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger' | 'success';
}

export interface PromptOptions extends ConfirmOptions {
  placeholder?: string;
  /** When true, an empty value is rejected with an inline error. */
  required?: boolean;
  initialValue?: string;
  requiredMessage?: string;
}

type Dialog =
  | { kind: 'confirm'; options: ConfirmOptions; resolve: (v: boolean) => void }
  | { kind: 'prompt'; options: PromptOptions; resolve: (v: string | null) => void };

interface UIState {
  toast: ToastState | null;
  dialog: Dialog | null;
  accountSwitcherOpen: boolean;
  showToast: (message: string, tone?: ToastTone) => void;
  hideToast: () => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
  closeDialog: () => void;
  setAccountSwitcherOpen: (open: boolean) => void;
}

let toastId = 0;

/** Ephemeral UI state (toasts, dialogs, sheets) — separate from domain data. */
export const useUIStore = create<UIState>()((set, get) => ({
  toast: null,
  dialog: null,
  accountSwitcherOpen: false,

  showToast: (message, tone = 'success') => {
    toastId += 1;
    set({ toast: { id: toastId, message, tone } });
  },
  hideToast: () => set({ toast: null }),

  confirm: (options) =>
    new Promise<boolean>((resolve) => {
      get().dialog?.kind === 'confirm' && (get().dialog as Extract<Dialog, { kind: 'confirm' }>).resolve(false);
      set({ dialog: { kind: 'confirm', options, resolve } });
    }),

  prompt: (options) =>
    new Promise<string | null>((resolve) => {
      set({ dialog: { kind: 'prompt', options, resolve } });
    }),

  closeDialog: () => set({ dialog: null }),
  setAccountSwitcherOpen: (open) => set({ accountSwitcherOpen: open }),
}));

/** Imperative helpers usable from any handler. */
export const toast = {
  success: (m: string) => useUIStore.getState().showToast(m, 'success'),
  error: (m: string) => useUIStore.getState().showToast(m, 'error'),
  info: (m: string) => useUIStore.getState().showToast(m, 'info'),
  warning: (m: string) => useUIStore.getState().showToast(m, 'warning'),
};

export const confirmDialog = (o: ConfirmOptions) => useUIStore.getState().confirm(o);
export const promptDialog = (o: PromptOptions) => useUIStore.getState().prompt(o);
