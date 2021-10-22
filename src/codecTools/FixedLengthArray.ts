// external
import * as t from 'io-ts';

export interface FixedLengthArrayBrand<T> extends Array<T> {
  /** Unique symbol to ensure uniqueness of this type across modules/packages */
  readonly fixedLengthArray: unique symbol;

  /** The min length of the array */
  readonly min: number;

  /** The max of the array */
  readonly max: number;
}

/**
 * The refinement for encoding/decoding strings of fixed length
 *
 * @param min - The array min length
 * @param max - The array max length
 * @param a - The array type
 * @returns The fixed length array codec
 */
export const FixedLengthArray = <C extends t.Mixed>(
  min: number,
  max: number,
  a: C,
): t.BrandC<t.ArrayC<C>, FixedLengthArrayBrand<C>> =>
  t.brand(
    t.array(a),
    (n: Array<C>): n is t.Branded<Array<C>, FixedLengthArrayBrand<C>> =>
      min <= n.length && n.length <= max,
    'fixedLengthArray',
  );

/** Override types */
export type FixedLengthArray<C extends t.Mixed> = t.TypeOf<
  t.BrandC<t.ArrayC<C>, FixedLengthArrayBrand<C>>
>;
