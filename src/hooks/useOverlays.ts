import { confirmDialog, promptDialog, runResult, toast, useUIStore } from '@/context/uiStore';

/** Toast API (success / error / info / warning) for components and screens. */
export function useToast() {
  return toast;
}

/** The toast currently on screen and how to dismiss it (used by ToastHost). */
export function useToastState() {
  const current = useUIStore((s) => s.toast);
  const hide = useUIStore((s) => s.hideToast);
  return { toast: current, hide };
}

/** The confirm / prompt dialog currently open and how to close it (used by DialogHost). */
export function useDialogState() {
  const dialog = useUIStore((s) => s.dialog);
  const closeDialog = useUIStore((s) => s.closeDialog);
  return { dialog, closeDialog };
}

export type OpenDialog = NonNullable<ReturnType<typeof useUIStore.getState>['dialog']>;

/** Confirm / prompt dialogs (`await confirmDialog({...})`, `await promptDialog({...})`). */
export function useDialogs() {
  return { confirmDialog, promptDialog };
}

/** Shows a success / error toast for a store action `Result`; returns `res.ok`. */
export function useRunResult() {
  return runResult;
}

/** Opens / closes the demo account switcher sheet (does not re-render on open state changes). */
export function useAccountSwitcher() {
  const setOpen = useUIStore((s) => s.setAccountSwitcherOpen);
  return { setOpen };
}

/** The account switcher sheet's open state + setter (used by the sheet itself). */
export function useAccountSwitcherState() {
  const open = useUIStore((s) => s.accountSwitcherOpen);
  const setOpen = useUIStore((s) => s.setAccountSwitcherOpen);
  return { open, setOpen };
}
