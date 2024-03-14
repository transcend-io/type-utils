// external
import * as t from 'io-ts';

// TODO: https://github.com/gcanti/io-ts/issues/429 - remove if/when io-ts supports this natively
export interface PartialRecordC<D extends t.Mixed, C extends t.Mixed>
  extends t.DictionaryType<
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
 * Like t.record, but where the keys are all optional to include
 * @param domain - The key type, like `'a' | 'b' | 'c'`. In this example, 0 or more of those keys would need to be present.
 * @param codomain - The value type
 * @param name - The optional name of the record type
 * @returns an io-ts compatible type
 */
export const partialRecord = <D extends t.Mixed, C extends t.Mixed>(
  domain: D,
  codomain: C,
  name?: string,
): PartialRecordC<D, C> =>
  t.record(
    t.union([domain, t.undefined]),
    codomain,
    name,
  ) as unknown as PartialRecordC<D, C>;
