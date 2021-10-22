// external
import * as t from 'io-ts';

/** The type refinement for encoding/decoding strings of fixed length */
export type FixedLengthStringBrand<N extends number> = {
  /** The length of the string */
  readonly length: N;
  /** Unique symbol to ensure uniqueness of this type across modules/packages */
  readonly FixedLengthString: unique symbol;
};

/**
 * The refinement for encoding/decoding strings of fixed length
 *
 * @param len - The string's length
 * @returns The fixed length string codec
 */
export const FixedLengthString = <N extends number>(
  len: N,
): t.BrandC<t.StringC, FixedLengthStringBrand<N>> =>
  t.brand(
    t.string, // a codec representing the type to be refined
    (s): s is t.Branded<string, FixedLengthStringBrand<N>> => s.length === len,
    'FixedLengthString', // the name must match the readonly field in the brand
  );

/** Override types */
export type FixedLengthString<N extends number> = t.TypeOf<
  t.BrandC<t.StringC, FixedLengthStringBrand<N>>
>;
