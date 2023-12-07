// external
import * as t from 'io-ts';

// global
import { invert } from './invert';

/**
 * We care about the values of an enum. This does not come out of the box with io-ts so we have to invert the enum first.
 * @param enm - The enum to invert
 * @returns The io-ts keyof
 */
export function valuesOf<TEnum extends string>(enm: {
  [k in string]: TEnum;
}): t.KeyofC<{ [k in TEnum]: unknown }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return t.keyof(invert(enm) as any);
}
