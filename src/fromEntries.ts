/**
 * Object.fromEntries that actually preserves entries as types.
 * @param entries - The entries to build the object from
 * @returns The object as built from the entries
 */
export function fromEntries<
  const T extends ReadonlyArray<readonly [PropertyKey, unknown]>,
>(entries: T): { [K in T[number] as K[0]]: K[1] } {
  return Object.fromEntries(entries) as { [K in T[number] as K[0]]: K[1] };
}
