// local
import type { ObjByString } from './types';

/**
 * An enumerated value
 */
export type Enumerate<T = string, TKey extends string = string> = {
  [key in TKey]: T;
};

/**
 * An enum declared in typescript. We require all values to be strings
 */
export type TypescriptEnum =
  | { [key in string]: string }
  | { [key in number]: string };

/**
 * An input when defining an enum can be an object of string -> string or a list of strings
 */
export type EnumInput<T, TKey extends string = string> =
  | Enumerate<T, TKey>
  | string[];

/**
 * Convert a list of strings to an "enum" object
 *
 * @param attributes - The attributes of the enum
 * @returns The input to become an enum
 */
export function listToEnum(attributes: string[]): Enumerate<string> {
  const init: Enumerate<string> = {};
  return attributes.reduce((acc, val) => {
    acc[val] = val;
    return acc;
  }, init);
}

/**
 * Create an enum object with a proxy handler that will throw an error when a property is access that is not in the enum
 *
 * @param attributes - The enums to merge into a single enum (all properties)
 * @returns The object proxy with error logger when a value is accessed outside of enum
 */
export function createEnum<T = string, TKey extends string = string>(
  ...attributes: EnumInput<T, TKey>[]
): Enumerate<T, TKey> {
  // Convert all to enums to objects
  const objAttributes = attributes.map((attrs) =>
    Array.isArray(attrs) ? listToEnum(attrs) : attrs,
  );

  return Object.assign({}, ...objAttributes);
}

/**
 * Filter an enum and return the keys that remain
 *
 * @param obj - The object to filter
 * @param filterFunc - The function to filter the enum key/values by
 * @returns The object keys that remained
 */
export function filterEnum<T extends ObjByString>(
  obj: T,
  filterFunc: (
    val: T[keyof T],
    key: keyof T,
    calculatedEnum: Enumerate<T[keyof T]>,
  ) => boolean,
): (keyof T)[] {
  return (
    (Object.keys(obj) as (keyof T)[])
      // Filter by value
      .filter((key) => filterFunc(obj[key], key, obj))
      // Return keys
      .map((key) => key)
  );
}

/**
 * Make an enum compatible with types -- in separate file because Logger/enums and Enum/index circular dependency
 *
 * @param x - The enum
 * @returns The object proxy with error logger when a value is accessed outside of enum
 */
export function makeEnum<
  T extends { [index: string]: U | U[] },
  U extends string,
>(x: T): T {
  return x;
}
