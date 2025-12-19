import type { Either, Right } from 'fp-ts/lib/Either';
import { either, isRight, left, right } from 'fp-ts/lib/Either';
import * as t from 'io-ts';

/**
 * Yanked from https://github.com/gcanti/io-ts/issues/322#issuecomment-584658211
 *
 * The code creates a way to reject objects that have extra/unexpected properties
 * beyond what's defined in a type schema. This is useful for strict validation
 * where you want to ensure incoming data contains only expected fields.
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

/**
 * Creates a type guard function that checks if a codec matches a specific tag.
 *
 * @template T - The expected codec type
 * @param tag - The tag string to match against (e.g., 'InterfaceType', 'PartialType')
 * @returns A type guard function that checks if a codec is of type T
 */
const getIsCodec =
  <T extends t.Any>(tag: string) =>
  (codec: t.Any): codec is T =>
    /* eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-explicit-any */
    (codec as any)._tag === tag;
const isInterfaceCodec = getIsCodec<t.InterfaceType<t.Props>>('InterfaceType');
const isPartialCodec = getIsCodec<t.PartialType<t.Props>>('PartialType');

/**
 * Extracts property definitions from various codec types, handling
 * nested structures like intersections and refinements.
 *
 * @param codec - The codec to extract properties from
 * @returns The props object containing all property definitions
 */
const getProps = (codec: t.HasProps): t.Props => {
  /* eslint-disable-next-line no-underscore-dangle */
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

/**
 * Generates a string representation of props for type naming.
 *
 * @param props - The props object to convert to string
 * @returns A comma-separated string of "key: type" pairs
 */
const getNameFromProps = (props: t.Props): string =>
  Object.keys(props)
    .map((k) => `${k}: ${props[k].name}`)
    .join(', ');

/**
 * Wraps a type name with Partial<> syntax for partial types.
 *
 * @param inner - The inner type string to wrap
 * @returns The wrapped type string in Partial<> format
 */
const getPartialTypeName = (inner: string): string => `Partial<${inner}>`;

/**
 * Generates a human-readable type name for the noExcess wrapper.
 *
 * @param codec - The codec to generate a name for
 * @returns A string representation of the excess-checked type
 */
const getNoExcessTypeName = (codec: t.Any): string => {
  if (isInterfaceCodec(codec)) {
    return `{| ${getNameFromProps(codec.props)} |}`;
  }
  if (isPartialCodec(codec)) {
    return getPartialTypeName(`{| ${getNameFromProps(codec.props)} |}`);
  }
  return `Excess<${codec.name}>`;
};

/**
 * Compares an object's keys against expected properties and returns either
 * the object (if valid) or a list of excess keys.
 *
 * @template T - The type of the object being checked
 * @param o - The object to check for excess keys
 * @param props - The expected properties definition
 * @returns Either a Left with excess keys array or Right with the valid object
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
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
 * Creates an enhanced codec that validates objects with strict property checking.
 *
 * The enhanced codec performs validation in three steps:
 * 1. Validates structure using the original codec
 * 2. Checks for excess properties using stripKeys
 * 3. Returns validation errors for any unexpected keys with the message "excess key "{key}" found"
 *
 * @template C - The codec type that extends HasProps
 * @param codec - The base codec to enhance with excess property checking
 * @param name - Optional custom name for the enhanced type (auto-generated if not provided)
 * @returns A new NoExcessType that wraps the original codec with strict validation
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
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (a) => codec.encode((stripKeys(a, props) as Right<any>).right),
    codec,
  );
};

/**
 * The NoExcess Type - a wrapper type to be used with io-ts to ensure there aren't any excess keys
 */
export class NoExcessType<
  C extends t.Any,
  A = C['_A'],
  O = A,
  I = unknown,
> extends t.Type<A, O, I> {
  public readonly _tag = 'NoExcessType' as const;

  /**
   * Creates a new NoExcessType instance that wraps another codec with excess property validation.
   *
   * @param name - The name of this type for debugging and error messages
   * @param is - Type guard function that checks if a value is of this type
   * @param validate - Validation function that decodes input and validates structure
   * @param encode - Encoding function that converts the type back to its output representation
   * @param type - The original wrapped codec that this NoExcessType enhances
   */
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
