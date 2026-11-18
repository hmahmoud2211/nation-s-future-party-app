import type { Result } from '@/store';
import { toast } from '@/store/uiStore';

/** Shows a success / error toast for a store action result. Returns `res.ok`. */
export function runResult(res: Result<unknown>, success: string): boolean {
  if (res.ok) toast.success(success);
  else toast.error(res.error);
  return res.ok;
}
