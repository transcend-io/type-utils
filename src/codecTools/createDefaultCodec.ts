// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as t from 'io-ts';

/**
 *  Creates a default value for an io-ts codec.
 * @param codec - the codec whose default we want to create
 * @returns an object honoring the io-ts codec
 *
 * Use Case: CSV Generation from Typed Objects
 * Consider the following codec:
 *
 * const UserCodec = t.intersection([
 *  t.type({
 *    id: t.string,
 *    name: t.string,
 *  }),
 *  t.partial({
 *    email: t.string,
 *  })
 * ])
 *
 * Suppose we want to generate a CSV file from the objects below with UserCodec type:
 *
 * const users = [
 *   { id: '1', name: 'Alice', email: 'alice@email.com' },
 *   { id: '2', name: 'Bob' },
 * ]
 *
 * To generate a CSV, we need a consistent set of columns (headers) that includes
 * ALL possible fields, even if some objects don't have all properties. In the example
 * above, though, notice that the second user does not have the email property.
 *
 * In such a case, createDefaultCodec(UserCodec) is useful to construct an object
 * with all possible fields, which can then be used to generate the complete CSV header:
 * "id,name,email".
 *
 * The example above is pretty simple, but things get very compliated the more complex
 * is the codec. In any case, createDefaultCodec is useful for outputting the expected CSV header.
 */
export const createDefaultCodec = <C extends t.Mixed>(
  codec: C,
): t.TypeOf<C> => {
  // If the codec is an union
  if (codec instanceof t.UnionType) {
    // The default for a union containing arrays is a default array
    const arrayType = codec.types.find(
      (type: any) => type instanceof t.ArrayType,
    );
    if (arrayType) {
      return createDefaultCodec(arrayType);
    }

    // If the union does not have an array, but have objects, the default is the object
    const objectType = codec.types.find(
      (type: any) =>
        type instanceof t.InterfaceType ||
        type instanceof t.PartialType ||
        type instanceof t.IntersectionType ||
        type instanceof t.ArrayType,
    );
    if (objectType) {
      return createDefaultCodec(objectType);
    }

    // Otherwise, null is next in priority
    const hasNull = codec.types.some(
      (type: any) => type instanceof t.NullType || type.name === 'null',
    );
    if (hasNull) {
      return null as t.TypeOf<C>;
    }

    // If no null type found, default to first type
    return createDefaultCodec(codec.types[0]);
  }

  // The default of an interface or partial type, is an object with that interface or partial type
  if (codec instanceof t.InterfaceType || codec instanceof t.PartialType) {
    const defaults: Record<string, any> = {};
    Object.entries(codec.props).forEach(([key, type]) => {
      defaults[key] = createDefaultCodec(type as any);
    });
    return defaults as t.TypeOf<C>;
  }

  // The default of an intersection, is the merged defaults of the intersection values
  if (codec instanceof t.IntersectionType) {
    return codec.types.reduce(
      (acc: t.TypeOf<C>, type: any) => ({
        ...acc,
        ...createDefaultCodec(type),
      }),
      {},
    );
  }

  /**
   * The default of an Array is an empty array, unless it is an array of objects, in which
   * case the default is an array of one default object.
   */
  if (codec instanceof t.ArrayType) {
    const elementType = codec.type;
    const isObjectType =
      elementType instanceof t.InterfaceType ||
      elementType instanceof t.PartialType ||
      elementType instanceof t.IntersectionType;

    return (
      isObjectType ? [createDefaultCodec(elementType)] : []
    ) as t.TypeOf<C>;
  }

  // The default of a literal type is its value
  if (codec instanceof t.LiteralType) {
    return codec.value as t.TypeOf<C>;
  }

  // The default of an object type is an empty object
  if (codec instanceof t.ObjectType) {
    return {} as t.TypeOf<C>;
  }

  // Handle primitive and common types
  switch (codec.name) {
    case 'string':
      return '' as t.TypeOf<C>;
    case 'number':
      return 0 as t.TypeOf<C>;
    case 'boolean':
      return false as t.TypeOf<C>;
    case 'null':
      return null as t.TypeOf<C>;
    case 'undefined':
      return undefined as t.TypeOf<C>;
    default:
      return null as t.TypeOf<C>;
  }
};
