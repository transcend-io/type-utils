import type { Either, Right } from 'fp-ts/lib/Either';
import { either, isRight, left, right } from 'fp-ts/lib/Either';
import * as t from 'io-ts';

/**
 * Yanked from https://github.com/gcanti/io-ts/issues/322#issuecomment-584658211
 *
 * The code creates a way to reject objects that have extra/unexpected properties
 * beyond what's defined in a type schema. This is useful for strict validation
 * where you want to ensure incoming data contains only expected fields.
 *
 * @example usage
 * ```
 * const UserCodec = t.type({
 *   name: t.string,
 *   age: t.number
 * });
 *
 * const StrictUserCodec = noExcess(UserCodec);
 * // This would pass
 * StrictUserCodec.decode({ name: "Kirby", age: 33 })
 *
 * // This would fail with "excess key 'email' found"
 * StrictUserCodec.decode({ name: "Kirby", age: 33, email: "kirby@transcend.io" })
 * ```
 */

const getIsCodec =
  <T extends t.Any>(tag: string) =>
  (codec: t.Any): codec is T =>
    (codec as any)._tag === tag;
const isInterfaceCodec = getIsCodec<t.InterfaceType<t.Props>>('InterfaceType');
const isPartialCodec = getIsCodec<t.PartialType<t.Props>>('PartialType');

// Extracts property definitions from various codec types, handling
// nested structures like intersections and refinements
const getProps = (codec: t.HasProps): t.Props => {
  switch (codec._tag) {
    case 'RefinementType':
    case 'ReadonlyType':
      return getProps(codec.type);
    case 'InterfaceType':
    case 'StrictType':
    case 'PartialType':
      return codec.props;
    case 'IntersectionType':
      return codec.types.reduce<t.Props>(
        (props, type) => Object.assign(props, getProps(type)),
        {},
      );
    default:
      return {};
  }
};

const getNameFromProps = (props: t.Props): string =>
  Object.keys(props)
    .map((k) => `${k}: ${props[k].name}`)
    .join(', ');

const getPartialTypeName = (inner: string): string => `Partial<${inner}>`;

const getNoExcessTypeName = (codec: t.Any): string => {
  if (isInterfaceCodec(codec)) {
    return `{| ${getNameFromProps(codec.props)} |}`;
  }
  if (isPartialCodec(codec)) {
    return getPartialTypeName(`{| ${getNameFromProps(codec.props)} |}`);
  }
  return `Excess<${codec.name}>`;
};

// Compares an object's keys against expected properties and returns either
// the object (if valid) or a list of excess keys
const stripKeys = <T = any>(o: T, props: t.Props): Either<Array<string>, T> => {
  const keys = Object.getOwnPropertyNames(o);
  const propsKeys = Object.getOwnPropertyNames(props);

  propsKeys.forEach((pk) => {
    const index = keys.indexOf(pk);
    if (index !== -1) {
      keys.splice(index, 1);
    }
  });

  return keys.length ? left(keys) : right(o);
};

/**
 * Creates an enhanced codec that:
 * 1. Validates structure using the original codec
 * 2. Checks for excess properties using stripKeys
 * 3. Returns validation errors for any unexpected keys with the message "excess key "{key}" found"
 */
export const noExcess = <C extends t.HasProps>(
  codec: C,
  name: string = getNoExcessTypeName(codec),
): NoExcessType<C> => {
  const props: t.Props = getProps(codec);
  return new NoExcessType<C>(
    name,
    (u): u is C => isRight(stripKeys(u, props)) && codec.is(u),
    (u, c) =>
      either.chain(t.UnknownRecord.validate(u, c), () =>
        either.chain(codec.validate(u, c), (a) =>
          either.mapLeft(stripKeys<C>(a, props), (keys) =>
            keys.map((k) => ({
              value: a[k],
              context: c,
              message: `excess key "${k}" found`,
            })),
          ),
        ),
      ),
    (a) => codec.encode((stripKeys(a, props) as Right<any>).right),
    codec,
  );
};

export class NoExcessType<
  C extends t.Any,
  A = C['_A'],
  O = A,
  I = unknown,
> extends t.Type<A, O, I> {
  public readonly _tag = 'NoExcessType' as const;
  public constructor(
    name: string,
    is: NoExcessType<C, A, O, I>['is'],
    validate: NoExcessType<C, A, O, I>['validate'],
    encode: NoExcessType<C, A, O, I>['encode'],
    public readonly type: C,
  ) {
    super(name, is, validate, encode);
  }
}
