/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { JSONSchema7 } from 'json-schema';
import * as t from 'io-ts';

/**
 * io-ts types compatible w/ JSON Schema
 */
type MappableType =
  | t.NumberType
  | t.StringType
  | t.NullType
  | t.BooleanType
  | t.LiteralType<any>
  | t.KeyofType<any>
  | t.InterfaceType<any>
  | t.DictionaryType<any, any>
  | t.PartialType<any>
  | t.DictionaryType<any, any>
  | t.UnionType<any>
  | t.ArrayType<any>
  | t.TupleType<any>
  | t.IntersectionType<any>
  | t.RefinementType<any>;

/**
 * Convert an io-ts codec to a JSON Schema (v7)
 * @param _type - an io-ts codec
 * @param strict - whether to enable strict mode
 * @returns a JSON schema object
 * @see https://json-schema.org/understanding-json-schema/basics.html
 */
export const toJsonSchema = (_type: any, strict = false): JSONSchema7 => {
  const type = _type as MappableType;

  if (type._tag === 'StringType') {
    return { type: 'string' };
  }
  if (type._tag === 'NumberType') {
    return { type: 'number' };
  }
  if (type._tag === 'NullType') {
    return { type: 'null' };
  }
  if (type._tag === 'BooleanType') {
    return { type: 'boolean' };
  }
  if (type._tag === 'LiteralType') {
    return { const: type.value };
  }
  if (type._tag === 'KeyofType') {
    return { type: 'string', enum: Object.keys(type.keys) };
  }
  if (type._tag === 'UnionType') {
    return { anyOf: type.types.map((t: any) => toJsonSchema(t, strict)) };
  }
  if (type._tag === 'IntersectionType') {
    return { allOf: type.types.map((t: any) => toJsonSchema(t, strict)) };
  }
  if (type._tag === 'InterfaceType') {
    return {
      type: 'object',
      required: Object.keys(type.props),
      properties: Object.fromEntries(
        Object.entries<t.Type<any>>(type.props).map(([key, subtype]) => [
          key,
          toJsonSchema(subtype, strict),
        ]),
      ),
      ...(strict ? { additionalProperties: false } : {}),
    };
  }
  if (type._tag === 'DictionaryType') {
    return {
      type: 'object',
      additionalProperties: toJsonSchema(type.codomain, strict),
    };
  }
  if (type._tag === 'PartialType') {
    return {
      type: 'object',
      properties: Object.fromEntries(
        Object.entries<t.Type<any>>(type.props).map(([key, subtype]) => [
          key,
          toJsonSchema(subtype, strict),
        ]),
      ),
      ...(strict ? { additionalProperties: false } : {}),
    };
  }
  if (type._tag === 'ArrayType') {
    return {
      type: 'array',
      items: toJsonSchema(type.type, strict),
    };
  }
  if (type._tag === 'TupleType') {
    return {
      type: 'array',
      items: type.types.map((t: any) => toJsonSchema(t, strict)),
    };
  }
  if (type._tag === 'RefinementType') {
    if (type.name === 'Int') {
      return { type: 'integer' };
    }
    return {
      ...toJsonSchema(type.type, strict),
      description: `Predicate: ${type.predicate.name || type.name}`,
    };
  }
  // could add more here for DateFromISOString, etc. etc.
  return unhandledType(type);
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-unused-vars
const unhandledType = (_shouldBeNever: never) => ({});

/* eslint-enable @typescript-eslint/no-explicit-any */
/* eslint-enable no-underscore-dangle */
