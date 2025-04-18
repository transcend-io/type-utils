// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-explicit-any */

import { aggregateObjects } from './aggregateObjects';

/**
 *
 * Flattens a nested object into a single-level object with concatenated key names. Useful
 * for converting objects to CSV.
 * @param param - The information about the object to flatten
 * @returns A flattened object where nested keys are joined with underscores
 * @example
 * const nested = {
 *   user: {
 *     name: 'John',
 *     address: {
 *       city: 'NY',
 *       zip: 10001
 *     },
 *     hobbies: ['reading', 'gaming']
 *   }
 * };
 *
 * flattenObject(nested)
 * // Returns: {
 * //   user_name: 'John',
 * //   user_address_city: 'NY',
 * //   user_address_zip: 10001,
 * //   user_hobbies: 'reading,gaming'
 * // }
 */
export const flattenObject = ({
  obj,
  prefix = '',
}: {
  /** the object to flatten */
  obj: any;
  /** The prefix to prepend to keys (used in recursion) */
  prefix?: string;
}): any =>
  !obj
    ? {}
    : Object.keys(obj ?? []).reduce(
        (acc, key) => {
          const newKey = prefix ? `${prefix}_${key}` : key;
          const entry = obj[key];

          // Handle arrays of objects
          if (
            Array.isArray(entry) &&
            entry.length > 0 &&
            entry.some((item) => typeof item === 'object' && item !== null)
          ) {
            // Flatten each object in the array
            const objEntries = entry.filter(
              (item) => typeof item === 'object' && item !== null,
            );
            const flattenedObjects = objEntries.map((item) =>
              flattenObject({ obj: item }),
            );
            // Aggregate the flattened objects
            const aggregated = aggregateObjects({ objs: flattenedObjects });
            // Add prefix to all keys
            Object.entries(aggregated).forEach(([k, v]) => {
              acc[`${newKey}_${k}`] = v;
            });
          }
          // Handle regular objects
          else if (
            typeof entry === 'object' &&
            entry !== null &&
            !Array.isArray(entry)
          ) {
            Object.assign(acc, flattenObject({ obj: entry, prefix: newKey }));
          }
          // Handle primitive arrays and other values
          else {
            acc[newKey] = Array.isArray(entry)
              ? entry
                  .map((e) => {
                    if (typeof e === 'string') {
                      return e.replaceAll(',', '');
                    }
                    return e ?? '';
                  })
                  .join(',')
              : typeof entry === 'string'
              ? entry.replaceAll(',', '')
              : entry ?? '';
          }
          return acc;
        },
        {} as Record<string, any>,
      );
