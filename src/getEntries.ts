// local
import type { ObjByString } from './types';

/**
 * Object.entries that actually preserves entries as types.
 * @param o - The object to get the entries from
 * @returns The entries of the object preserving type
 */
export function getEntries<TKey extends keyof TObj, TObj extends ObjByString>(
  o: TObj,
): [TKey, TObj[TKey]][] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.entries(o) as any;
}
