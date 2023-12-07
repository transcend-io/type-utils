// local
import { createEnum } from './enum';
import { getKeys } from './getKeys';
import type { ObjByString, StringKeys } from './types';

/**
 * Apply a function to each value of an object. Similar to lodash.mapValues but should preserve the typing of the keys.
 *
 * This allows one to define an object keys in an enum and then the resulting map should keep the same typing
 * @param obj - The object to apply the function to
 * @param applyFunc - The function to apply
 * @returns The updated object
 */
export function apply<TInput extends ObjByString, TOutput>(
  obj: TInput,
  applyFunc: (
    value: TInput[keyof TInput],
    key: StringKeys<TInput>,
    fullObj: typeof obj,
    index: number,
  ) => TOutput,
): { [key in keyof TInput]: TOutput } {
  const result = Object.keys(obj).reduce(
    (acc, key, ind) =>
      Object.assign(acc, {
        [key]: applyFunc(obj[key], key as StringKeys<TInput>, obj, ind),
      }),
    {},
  );
  return result as { [key in keyof TInput]: TOutput };
}

/**
 * Apply a function to each value of an object. Similar to lodash.mapValues but should preserve the typing of the keys.
 *
 * This allows one to define an object keys in an enum and then the resulting map should keep the same typing
 * @param obj - The object to apply the function to
 * @param applyFunc - The function to apply
 * @returns The updated object
 */
export async function asyncApply<TInput extends ObjByString, TOutput>(
  obj: TInput,
  applyFunc: (
    value: TInput[keyof TInput],
    key: StringKeys<TInput>,
    fullObj: typeof obj,
    index: number,
  ) => Promise<TOutput>,
): Promise<{ [key in keyof TInput]: TOutput }> {
  const entries = await Promise.all(
    getKeys(obj).map(async (key, ind) => ({
      key,
      value: await applyFunc(obj[key], key as StringKeys<TInput>, obj, ind),
    })),
  );

  const result = entries.reduce(
    (acc, { key, value }) =>
      Object.assign(acc, {
        [key]: value,
      }),
    {},
  );

  return result as { [key in keyof TInput]: TOutput };
}

/**
 * Convert a typescript enum to a mapping of [value]: [value] and then call apply on that
 * @param enm - The object to apply the function to
 * @param applyFunc - The function to apply
 * @returns The updated object
 */
export function applyEnum<TEnum extends string, TOutput>(
  enm: { [k in string]: TEnum },
  applyFunc: (
    value: TEnum,
    key: TEnum,
    fullObj: typeof enm,
    index: number,
  ) => TOutput,
): { [key in TEnum]: TOutput } {
  const obj = createEnum<TEnum, TEnum>(Object.values(enm));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return apply(obj, applyFunc) as any;
}
