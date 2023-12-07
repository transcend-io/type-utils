// external
import { unsafeCoerce } from 'fp-ts/lib/function';
import * as t from 'io-ts';

/** A record with optional keys */
export interface DictionaryC<
  D extends t.Mixed,
  C extends t.Mixed,
> extends t.DictionaryType<
    D,
    C,
    {
      [K in t.TypeOf<D>]?: t.TypeOf<C>;
    },
    {
      [K in t.OutputOf<D>]?: t.OutputOf<C>;
    },
    unknown
  > {}

/**
 * Helper to encode/decode a record with partial keys.
 * Copied from https://github.com/gcanti/io-ts/issues/429#issuecomment-655394345
 * @param keys - The possible dictionary keys
 * @param values - The possible dictionary values
 * @param name - (Optional) name of this dictionary
 * @returns The codec for a dictionary
 */
export const dictionary = <D extends t.Mixed, C extends t.Mixed>(
  keys: D,
  values: C,
  name?: string,
): DictionaryC<D, C> =>
  unsafeCoerce(t.record(t.union([keys, t.undefined]), values, name));
