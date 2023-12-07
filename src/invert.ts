// local
import { getEntries } from './getEntries';

/**
 * Invert an object so that the values look up the keys.
 * If the object has an array as the value, each item in the array will be inverted.
 * @param obj - The object to invert
 * @param throwOnDuplicate - When true, throw error if duplicate key detected
 * @returns The inverted object
 */
export function invert<TKey extends string, TValue extends string | string[]>(
  obj: { [key in TKey]?: TValue },
  throwOnDuplicate = true,
): {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key in TValue extends (infer TK)[] ? TK : TValue]: TValue extends any[]
    ? TKey[]
    : TKey;
} {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {} as any;

  // Invert
  getEntries(obj).forEach(([key, instance]: [TKey, TValue | undefined]) => {
    // Ensure no undefined values
    if (instance === undefined) {
      throw new Error('inverse found undefined value, this is not supported');
    }

    // Handle array case
    if (Array.isArray(instance)) {
      instance.forEach((listKey) => {
        // Create a new entry
        if (!result[listKey]) {
          result[listKey] = [key];
        } else {
          // Add to existing
          result[listKey].push(key);
        }
      });
    } else {
      // Ensure we do not overwrite duplicates
      if (result[instance] && throwOnDuplicate) {
        throw new Error(
          `Encountered duplicate value inverting object: "${instance}: ${key} and ${result[instance]}"`,
        );
      }
      result[instance] = key;
    }
  });
  return result;
}

/**
 * Safely invert an object to be { [key in TValue]: TKey[] }
 * @param obj - The object to invert
 * @returns The inverted object
 */
export function invertSafe<TKey extends string, TValue extends string>(obj: {
  [key in TKey]: TValue | TValue[];
}): {
  [key in TValue]: TKey[];
} {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};

  // Invert
  getEntries(obj).forEach(([key, instance]) => {
    // Ensure no undefined values
    if (instance === undefined) {
      throw new Error('inverse found undefined value, this is not supported');
    }

    // Handle array case
    if (Array.isArray(instance)) {
      instance.forEach((listKey) => {
        // Create a new entry
        if (!result[listKey]) {
          result[listKey] = [key];
        } else {
          // Add to existing
          result[listKey].push(key);
        }
      });
    } else if (!result[instance]) {
      result[instance] = [key];
    } else {
      // Add to existing
      result[instance].push(key);
    }
  });
  return result;
}
