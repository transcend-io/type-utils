/**
 * Object.values that actually preserves values as types.
 *
 * @param o - The object to get the values from
 * @returns The values of the object preserving type
 */
export function getValues<TVal>(
  o: {
    [k in string | number | symbol]: TVal;
  },
): TVal[] {
  return Object.values(o) as TVal[];
}
