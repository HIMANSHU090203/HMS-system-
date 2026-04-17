import React from 'react';

const zeroLikePattern = /^0+(?:\.0+)?$/;

function isZeroLike(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  return v === '0' || zeroLikePattern.test(v);
}

/**
 * For controlled numeric inputs that display an initial "0":
 * selecting the whole value on focus/click makes the first typed digit (1-9)
 * replace the zero (avoids "0300" style entries).
 */
export function autoSelectIfZero(e: React.FocusEvent<HTMLInputElement>): void {
  const el = e.currentTarget;
  if (!isZeroLike(el.value)) return;

  // Defer selection to avoid some browsers overwriting it
  // when focus was triggered via mouse click.
  setTimeout(() => el.select(), 0);
}

/**
 * Use on mouse/pointer down so the browser doesn't place the caret
 * after the 0 (which would cause "0300" when typing).
 */
export function autoSelectIfZeroMouseDown(
  e: React.MouseEvent<HTMLInputElement>
): void {
  const el = e.currentTarget;
  if (!isZeroLike(el.value)) return;

  e.preventDefault();
  el.focus();
  requestAnimationFrame(() => el.select());
}

