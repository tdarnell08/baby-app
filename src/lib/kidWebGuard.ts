import { useEffect } from 'react';
import { Platform } from 'react-native';

export const KID_ROOT_ID = 'kid-root';
export const KID_PAINT_ID = 'kid-paint';
export const KID_HOLD_ID = 'kid-hold-target';

const STYLE_ID = 'kid-web-guard-style';

const CSS = `
#${KID_ROOT_ID}, #${KID_ROOT_ID} * {
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
[id^='${KID_PAINT_ID}'], [id^='${KID_PAINT_ID}'] *, #${KID_HOLD_ID}, #${KID_HOLD_ID} * {
  touch-action: none;
}
html, body {
  overscroll-behavior: none;
  -webkit-text-size-adjust: 100%;
}
`;

const insideKid = (target: EventTarget | null) =>
  target instanceof Element && target.closest(`#${KID_ROOT_ID}`) !== null;

/**
 * Safari on iPhone turns a long press into text selection and the copy callout.
 * Kid Mode relies on a 3 second hold, so on web we switch all of that off for
 * as long as the Kid Mode screen is mounted. Native builds do not need this.
 */
export function useKidWebGuard() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    const block = (e: Event) => {
      if (insideKid(e.target)) e.preventDefault();
    };
    const clearSelection = () => {
      const sel = window.getSelection?.();
      if (sel && sel.rangeCount > 0 && insideKid(sel.anchorNode?.parentElement ?? null)) sel.removeAllRanges();
    };

    document.addEventListener('contextmenu', block);
    document.addEventListener('selectstart', block);
    document.addEventListener('dragstart', block);
    document.addEventListener('selectionchange', clearSelection);
    return () => {
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('selectstart', block);
      document.removeEventListener('dragstart', block);
      document.removeEventListener('selectionchange', clearSelection);
      document.getElementById(STYLE_ID)?.remove();
    };
  }, []);
}

/**
 * Stops iOS from starting a selection or callout from the hold target, while the
 * normal press events keep firing. Only the hold target needs this: calling
 * preventDefault on touchstart elsewhere would also cancel the synthesised click.
 */
export function guardHoldTarget(): (() => void) | undefined {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return undefined;
  const el = document.getElementById(KID_HOLD_ID);
  if (!el) return undefined;
  const prevent = (e: Event) => {
    if (e.cancelable) e.preventDefault();
  };
  el.addEventListener('touchstart', prevent, { passive: false });
  el.addEventListener('contextmenu', prevent);
  return () => {
    el.removeEventListener('touchstart', prevent);
    el.removeEventListener('contextmenu', prevent);
  };
}
