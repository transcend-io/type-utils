import * as t from 'io-ts';

/**
 *  Creates a default value for an io-ts codec.
 *
 * @param codec - the codec whose default we want to create
 * @returns an object honoring the io-ts codec
 */
export const createDefaultCodec = <C extends t.Mixed>(
  codec: C,
): t.TypeOf<C> => {
// If the codec is an union
  if (codec instanceof t.UnionType) {
    // The default for a union containing arrays is an empty array
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

  // Handle primitive and common types
  switch (codec.name) {
    case 'string':
      return '' as t.TypeOf<C>;
    case 'number':
      return null as t.TypeOf<C>;
    case 'boolean':
      return null as t.TypeOf<C>;
    case 'null':
      return null as t.TypeOf<C>;
    case 'undefined':
      return undefined as t.TypeOf<C>;
    default:
      return null as t.TypeOf<C>;
  }
};
