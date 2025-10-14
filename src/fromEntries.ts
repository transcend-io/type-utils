/**
 * Object.entries that actually preserves entries as types.
 * @param o - The object to get the entries from
 * @returns The entries of the object preserving type
 */
export function fromEntries<
  const T extends ReadonlyArray<readonly [PropertyKey, unknown]>,
>(
  entries: T,
): { [K in T[number] as K[0]]: K[1] } {
  return Object.fromEntries(entries) as { [K in T[number] as K[0]]: K[1] };
}
