'use client';

import { useEffect, useRef } from 'react';
import { KEYBOARD_MAP, type DrumPiece } from '@/types';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return target.isContentEditable;
}

export function useKeyboard(onDrumKey: (piece: DrumPiece) => void) {
  const callbackRef = useRef(onDrumKey);
  const heldKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    callbackRef.current = onDrumKey;
  }, [onDrumKey]);

  useEffect(() => {
    const held = heldKeysRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key.toLowerCase();
      const piece = KEYBOARD_MAP[key];
      if (!piece) return;

      if (event.repeat) return;
      if (held.has(key)) return;

      held.add(key);
      callbackRef.current(piece);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key.toLowerCase();
      held.delete(key);
    };

    const onBlur = () => {
      held.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      held.clear();
    };
  }, []);
}
