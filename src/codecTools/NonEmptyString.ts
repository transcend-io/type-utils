// external
import * as t from 'io-ts';

/** The type refinement for encoding/decoding non-empty strings */
type NonEmptyStringBrand = {
  /** Unique symbol to ensure uniqueness of this type across modules/packages */
  readonly NonEmptyString: symbol;
};

/** The refinement for encoding/decoding non-empty strings */
export const NonEmptyString = t.brand(
  t.string, // a codec representing the type to be refined
  (s): s is t.Branded<string, NonEmptyStringBrand> => s.trim().length !== 0,
  'NonEmptyString', // the name must match the readonly field in the brand
);

/** Override types */
export type NonEmptyString = t.TypeOf<typeof NonEmptyString>;
