// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
  * Type that represents the partitioned properties from an object type T.
 * For each selected property K from T, creates an array of that property's type.
 * Also includes a 'rest' property containing an array of objects with all non-selected properties.
 *
 * @template T - The source object type
 * @template K - The keys to partition from T
 * @example
 * // Given an array of objects:
 * const items = [
 *   { id: 1, name: 'John', age: 25, city: 'NY' },
 *   { id: 2, name: 'Jane', age: 30, city: 'LA' }
 * ];
 *
 * // And selecting 'id' and 'name':
 * type Result = PartitionedArrayProperties<typeof items[0], 'id' | 'name'>;
 *
 * // Result will be typed as:
 * {
 *   id: number[];        // [1, 2]
 *   name: string[];      // ['John', 'Jane']
 *   rest: Array<{        // [{ age: 25, city: 'NY' }, { age: 30, city: 'LA' }]
 *     age: number;
 *     city: string;
 *   }>;
 * }
 */
type PartitionedArrayProperties<T, K extends keyof T> = {
  [P in K]: Array<T[P]>;
} & {
  /** The array of remaining properties not selected for partitioning */
  rest: Array<Omit<T, K>>;
};
  
/**
 * Partitions an array of objects by separating specified properties into their own arrays
 * while keeping the remaining properties grouped in a 'rest' array.
 *
 * @template T - The type of objects in the input array
 * @template K - The keys of properties to partition
 * @param items - Array of objects to partition
 * @param properties - Array of property keys to separate into their own arrays
 * @returns An object containing arrays for each selected property and a rest array for remaining properties
 * @example
 * const items = [
 *   { id: 1, name: 'John', age: 25, city: 'NY' },
 *   { id: 2, name: 'Jane', age: 30, city: 'LA' }
 * ]
 * const result = partitionObjectArray(items, ['id', 'name']);
 * // Returns: { 
 * //   id: [1, 2], 
 * //   name: ['John', 'Jane'], 
 * //   rest: [{age: 25, city: 'NY'}, {age: 30, city: 'LA'}] 
 * // }
 */
  export const partitionObjectArray = <T extends object, K extends keyof T>(
    items: T[],
    properties: K[],
  ): PartitionedArrayProperties<T, K> =>
    items.reduce((acc, item) => {
      const result = { ...acc } as PartitionedArrayProperties<T, K>;
  
      properties.forEach((prop) => {
        const currentArray = (acc[prop] || []) as T[K][];
        result[prop] = [...currentArray, item[prop]] as any;
      });
  
      const restObject = {} as Omit<T, K>;
      Object.entries(item).forEach(([key, value]) => {
        if (!properties.includes(key as K)) {
          (restObject as any)[key] = value;
        }
      });
  
      result.rest = [...(acc.rest || []), restObject];
  
      return result;
    }, {} as PartitionedArrayProperties<T, K>);
  
  