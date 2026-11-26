import { useSyncExternalStore } from 'react';
import { AccessibilityInfo } from 'react-native';

// One system subscription shared by every glass surface (there can be dozens on screen).
let reduceTransparency = false;
let started = false;
const listeners = new Set<() => void>();

function set(value: boolean) {
  if (value === reduceTransparency) return;
  reduceTransparency = value;
  listeners.forEach((l) => l());
}

function start() {
  if (started) return;
  started = true;
  // Not every platform implements the query (React Native Web), so both calls are guarded.
  AccessibilityInfo.isReduceTransparencyEnabled?.()
    ?.then(set)
    .catch(() => undefined);
  AccessibilityInfo.addEventListener?.('reduceTransparencyChanged', set);
}

function subscribe(listener: () => void) {
  start();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => reduceTransparency;

/**
 * True when the user has asked the system to reduce transparency (iOS: Settings › Accessibility › Display &
 * Text Size). Glass surfaces then fall back to near-opaque fills so text stays legible.
 */
export function useReduceTransparency(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
