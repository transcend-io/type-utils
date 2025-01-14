// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Type representing a transposed array of objects.
 *
 * For each selected property K from the original object type T:
 * - Creates an array containing all values of that property
 * - The array type matches the property's original type
 * - Includes a 'rest' array containing all non-selected properties
 * @template T - The source object type
 * @template K - The keys to transpose into arrays
 * @example
 * // Original array of objects:
 * const users = [
 *   { id: 1, name: 'John', age: 25, city: 'NY' },
 *   { id: 2, name: 'Jane', age: 30, city: 'LA' }
 * ];
 *
 * // Type for transposing 'id' and 'name':
 * type Result = TransposedObjectArray<typeof users[0], 'id' | 'name'>;
 *
 * // Resulting type structure:
 * {
 *   id: number[];      // Array of all IDs: [1, 2]
 *   name: string[];    // Array of all names: ['John', 'Jane']
 *   rest: Array<{      // Array of remaining properties
 *     age: number;     // [{ age: 25, city: 'NY' },
 *     city: string;    //  { age: 30, city: 'LA' }]
 *   }>;
 * }
 */
type TransposedObjectArray<T, K extends keyof T> = {
  [P in K]: Array<T[P]>;
} & {
  /** Properties not selected for transposition */
  rest: Array<Omit<T, K>>;
};

/**
 * Transposes an array of objects by converting selected properties into arrays
 * while keeping the remaining properties grouped in a 'rest' array.
 * @template T - The type of objects in the input array
 * @template K - The keys of properties to transpose
 * @param param - the objects, properties, and transposing options
 * @returns An object containing transposed arrays for each selected property
 * @example
 * const objects = [
 *   { id: 1, name: 'John', age: 25 },
 *   { id: 2, name: 'Jane', age: 30 }
 * ]
 * const result = transposeObjectArray({objects, properties: ['id', 'name']});
 * // Returns: {
 * //   id: [1, 2],
 * //   name: ['John', 'Jane'],
 * //   rest: [{age: 25}, {age: 30}]
 * // }
 */
export const transposeObjectArray = <T extends object, K extends keyof T>(
  { objects, properties, options = { includeOtherProperties: true } }: {
    /** Array of objects to transpose */
    objects: T[];
  /** Array of property keys to transpose into arrays */
  properties: K[];
  /** Options for how to transpose the array */
  options?: {
    /** Whether to include non-tranposed properties in the final result */
    includeOtherProperties?: boolean;
  }
  }
): TransposedObjectArray<T, K> =>
  objects.reduce(
    (acc, item) => {
      const result = { ...acc } as TransposedObjectArray<T, K>;

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

      if (options.includeOtherProperties) {
        result.rest = [...(acc.rest || []), restObject];
      }

      return result;
    },
    {} as TransposedObjectArray<T, K>,
  );
