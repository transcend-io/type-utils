// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 *
 * Aggregates multiple objects into a single object by combining values of matching keys.
 * For each key present in any of the input objects, creates a comma-separated string
 * of values from all objects.
 * @param param - the objects to aggregate and the aggregation method
 * @returns a single object containing all unique keys with aggregated values
 * @example
 * const obj1 = { name: 'John', age: 30 };
 * const obj2 = { name: 'Jane', city: 'NY' };
 * const obj3 = { name: 'Bob', age: 25 };
 *
 * // Without wrap
 * aggregateObjects({ objs: [obj1, obj2, obj3] })
 * // Returns: { name: 'John,Jane,Bob', age: '30,,25', city: ',NY,' }
 *
 * // With wrap
 * aggregateObjects({ objs: [obj1, obj2, obj3], wrap: true })
 * // Returns: { name: '[John],[Jane],[Bob]', age: '[30],[],[25]', city: '[],[NY],[]' }
 */
export const aggregateObjects = ({
    objs,
    wrap = false,
  }: {
    /** the objects to aggregate in a single one */
    objs: any[];
    /** whether to wrap the concatenated values in a [] */
    wrap?: boolean;
  }): any => {
    const allKeys = Array.from(
        new Set(
          objs.flatMap((a) => (a && typeof a === 'object' ? Object.keys(a) : []))
        )
      );

    // Reduce into a single object, where each key contains concatenated values from all input objects
    return allKeys.reduce((acc, key) => {
      const values = objs
        .map((o) => (wrap ? `[${o?.[key] ?? ''}]` : o?.[key] ?? ''))
        .join(',');
      acc[key] = values;
      return acc;
    }, {} as Record<string, any>);
  };