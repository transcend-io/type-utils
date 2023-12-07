/**
 * A typed version of lodash's _.groupBy.
 *
 * Returns a map of identifiers to elements from a given
 * list that return that identifier.
 * @param iterable - the list to group by keys
 * @param getKey - the function to apply to an element of the list to get the key it should belong in
 * @returns a map of identifiers to values that mapped to that identifier
 */
export function groupBy<T, K>(
  iterable: T[],
  getKey: (item: T) => K,
): Map<K, T[]> {
  return iterable.reduce((groupedItems, item) => {
    const groupedKey = getKey(item);
    return groupedItems.set(groupedKey, [
      ...(groupedItems.get(groupedKey) ?? []),
      item,
    ]);
  }, new Map<K, T[]>());
}
