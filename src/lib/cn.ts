import clsx, { type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge, taught about the project's custom theme colours so that
 * `bg-navy` correctly overrides the `bg-surface` baked into base components.
 */
const THEME_COLORS = [
  'navy',
  'navy-soft',
  'navy-mist',
  'gold',
  'gold-deep',
  'gold-soft',
  'gold-wash',
  'ivory',
  'surface',
  'line',
  'line-soft',
  'slate',
  'slate-light',
  'ok',
  'ok-wash',
  'warn',
  'warn-wash',
  'alert',
  'alert-wash',
  'idle',
  'idle-wash',
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'bg-color': [{ bg: THEME_COLORS }],
      'text-color': [{ text: THEME_COLORS }],
      'border-color': [{ border: THEME_COLORS }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
