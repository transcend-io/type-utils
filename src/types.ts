/**
 * An arbitrary object keyed by strings for naming consistency
 */
export type ObjByString = { [key in string]: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * An arbitrary function
 */
export type AnyFunction = (...args: any[]) => any; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * An arbitrary array
 */
export type AnyArray = any[]; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * The type of the underlying array
 */
export type ArrType<TData extends AnyArray> = TData extends (infer DataT)[]
  ? DataT
  : never;

/**
 * The type of the underlying promise
 */
export type PromiseType<TData> = TData extends Promise<infer R> ? R : TData; // if not a promise, return it anyways

/**
 * The type of the underlying array
 */
export type ArrOrIdentityType<TData> = TData extends (infer DataT)[]
  ? DataT
  : TData;

/**
 * Helper to create type or type[]
 */
export type OrArray<T> = T | T[];

/**
 * To make the inspected type more tractable than a bunch of intersections
 */
export type Identity<T> = {
  [K in keyof T]: T[K];
};

/**
 * Identity but recursive
 */
export type RecursiveIdentity<T> = T extends AnyArray
  ? ArrType<T> extends object // Call identity on each array item if an array of objects
    ? Identity<ArrType<T>>[]
    : T
  : T extends string // string handled before object due to nominal typing
  ? T
  : T extends object // object needs identity on each value
  ? {
      // Note: this only goes 2 levels
      [K in keyof T]: T[K] extends object ? Identity<T[K]> : T[K];
    }
  : T; // just return what we got

/**
 * Make selected object keys defined by K optional in type T
 */
export type Optionalize<T, K extends keyof T> = Identity<
  Omit<T, K> & Partial<T>
>;

/**
 * Make select arguments of a type required
 */
export type Requirize<T, K extends keyof T> = Identity<
  Omit<T, K> & Required<{ [P in K]: T[P] }>
>;

/**
 * Convert keys of a type to strings
 */
export type Stringify<T, K extends keyof T> = Omit<T, K> &
  {
    [P in keyof T]: string;
  };

/**
 * Extract string keys from an object
 */
export type StringKeys<TObj extends ObjByString> = Extract<keyof TObj, string>;

/**
 * Extract associated values of string keys
 */
export type StringValues<TObj extends ObjByString> = TObj[keyof TObj];

/**
 * String keys without extends enforcement
 */
export type StringKeysSafe<T> = T extends ObjByString
  ? StringKeys<T>
  : undefined;

/**
 * Extract the sub types of an object, based on some condition.
 *
 * In other words, given an object with mixed value types, filter the key-value pairs to only
 * contain values that extend `Condition`
 */
export type SubType<Base, Condition> = Pick<
  Base,
  { [Key in keyof Base]: Base[Key] extends Condition ? Key : never }[keyof Base]
>;

/**
 * Inverse of SubType
 */
export type SubNotType<Base, Condition> = Pick<
  Base,
  { [Key in keyof Base]: Base[Key] extends Condition ? never : Key }[keyof Base]
>;

/**
 * Subtype but optional inputs become require
 */
export type SubTypeRequired<Base, Condition> = SubType<
  Required<Base>,
  Condition
>;

// ////// //
// Spread //
// ////// //

/**
 * Names of properties in T with types that include undefined
 */
type OptionalPropertyNames<T> = {
  [K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T];

/**
 * Common properties from L and R with undefined in R[K] replaced by type in L[K]
 */
type SpreadProperties<L, R, K extends keyof L & keyof R> = {
  [P in K]: L[P] | Exclude<R[P], undefined>;
};

/**
 * Type of { ...L, ...R }, more accurate than typeof L & typeof R
 */
export type Spread<L, R> = Identity<
  // Properties in L that don't exist in R
  Pick<L, Exclude<keyof L, keyof R>> &
    // Properties in R with types that exclude undefined
    Pick<R, Exclude<keyof R, OptionalPropertyNames<R>>> &
    // Properties in R, with types that include undefined, that don't exist in L
    Pick<R, Exclude<OptionalPropertyNames<R>, keyof L>> &
    // Properties in R, with types that include undefined, that exist in L
    SpreadProperties<L, R, OptionalPropertyNames<R> & keyof L>
>;

/**
 * Soft spread
 */
export type Merge<L, R> = Identity<
  // Properties in L that don't exist in R
  Pick<L, Exclude<keyof L, keyof R>> & R
>;

/**
 * Convert unions to intersection
 */
export type UnionToIntersection<U> = (
  U extends any // eslint-disable-line @typescript-eslint/no-explicit-any
    ? (k: U) => void
    : never
) extends (k: infer I) => void
  ? I
  : never;

/**
 * Loop over an object and recursively replace all values.
 *
 * i.e. RecursiveTypeReplace<string | number | { message: string, value: number } | () => Promise<string>, string, boolean>;
 * Outputs: boolean | number | { message: boolean, value: number } | () => Promise<boolean>
 */
export type RecursiveTypeReplace<T, TReplace, TReplaceWith> = T extends Promise<
  infer R
> // we should leave Promise constructor as is and replace types in the inner value
  ? Promise<RecursiveTypeReplace<R, TReplace, TReplaceWith>>
  : T extends (...args: infer ArgsR) => infer ReturnR
  ? // recurse into the return type of functions, note arguments are left as is
    (...args: ArgsR) => RecursiveTypeReplace<ReturnR, TReplace, TReplaceWith>
  : T extends RegExp
  ? // special case regex to preserve constructor, list additional constructors to ignore here
    T
  : Extract<T, string> extends never // if T is never a string
  ? { [k in keyof T]: RecursiveTypeReplace<T[k], TReplace, TReplaceWith> } // map over the object types recursively
  :
      | Exclude<
          {
            [k in keyof T]: RecursiveTypeReplace<T[k], TReplace, TReplaceWith>;
          },
          string
        >
      | TReplaceWith; // replace string with intl and recurse

/**
 * Recursively replace one type in an object
 */
export type RecursiveObjectReplace<TBase, TReplaceCondition, TReplaceWith> =
  TBase extends TReplaceCondition
    ? TReplaceWith
    : TBase extends (infer R)[]
    ? RecursiveObjectReplace<R, TReplaceCondition, TReplaceWith>
    : TBase extends object
    ? {
        [k in keyof TBase]: TBase[k] extends (infer R)[][]
          ? RecursiveObjectReplace<R, TReplaceCondition, TReplaceWith>[][]
          : TBase[k] extends (infer R)[][] | undefined
          ?
              | RecursiveObjectReplace<R, TReplaceCondition, TReplaceWith>[][]
              | undefined
          : TBase[k] extends (infer R)[]
          ? RecursiveObjectReplace<R, TReplaceCondition, TReplaceWith>[]
          : TBase[k] extends (infer R)[] | undefined
          ?
              | RecursiveObjectReplace<R, TReplaceCondition, TReplaceWith>[]
              | undefined
          : TBase[k] extends TReplaceCondition
          ? TReplaceWith
          : TBase[k] extends TReplaceCondition | undefined
          ? TReplaceWith | undefined
          : RecursiveObjectReplace<TBase[k], TReplaceCondition, TReplaceWith>;
      }
    : TBase;

/**
 * Make values nullable.
 */
export type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

/**
 * Deep partial of a type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

/**
 * Infer the type wrapped by a Promise.
 *
 * TODO: https://transcend.height.app/T-15646 - Remove once on TypeScript 4.5.
 */
export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

/**
 * Utility type that passes through the interface given that its keys are exactly equal to the keys string union
 */
export type KeysStrictlyEqual<
  Keys extends string,
  Interface extends [keyof Interface] extends [Keys]
    ? [Keys] extends [keyof Interface]
      ? unknown
      : never
    : never,
> = Interface;
