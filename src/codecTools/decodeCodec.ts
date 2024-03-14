import { fold, isLeft } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import * as t from 'io-ts';

/**
 * Determine the codec paths that are invalid.
 * @param v - Validation errors.
 * @returns The error strings formatted for human consumption.
 */
function getPaths<A>(v: t.Validation<A>): string[] {
  return pipe(
    v,
    fold(
      (errors) =>
        errors.map((error) => {
          const lastCtx = error.context.at(-1);
          const fullPath = error.context.map(({ key }) => key).join('.');
          return `${fullPath} expected type '${lastCtx?.type.name}'`;
        }),

      () => ['no errors'],
    ),
  );
}

/**
 * Get custom error messages for the errors.
 * @param v - Validation errors.
 * @param customErrorFromContext - Custom mapper function.
 * @returns The custom error strings formatted for human consumption.
 */
function getCustomErrors<A>(
  v: t.Validation<A>,
  customErrorFromContext: (validationContext: t.Context) => string,
): string[] {
  return pipe(
    v,
    fold(
      (errors) => errors.map((error) => customErrorFromContext(error.context)),
      () => ['no errors'],
    ),
  );
}

export const CODEC_ERROR_MESSAGE = 'Failed to decode codec:';

/**
 * Decode a codec, returning the value if contents are validated, else throws an error
 * @param codec - The codec to decode with
 * @param txt - The text to JSON parse
 * @param parse - If a string is provided, assume it is JSON and call JSON.parse on it
 * @param customErrorFromContext - a function to custom process validation contexts to error messages
 * @returns The result of the function or the object if it was not a function
 */
export function decodeCodec<TCodec extends t.Any>(
  codec: TCodec,
  txt: string | object | object[] | null | unknown,
  parse = true,
  customErrorFromContext:
    | ((validationContext: t.Context) => string)
    | undefined = undefined,
): t.TypeOf<TCodec> {
  // uncomment the below to view the response pre-decode
  const decoded = codec.decode(
    parse && typeof txt === 'string' ? JSON.parse(txt) : txt,
  );
  // Log errors on failure
  if (isLeft(decoded)) {
    const errorPaths = getPaths(decoded);
    const customError =
      customErrorFromContext !== undefined
        ? JSON.stringify(
            getCustomErrors(decoded, customErrorFromContext),
            null,
            2,
          )
        : undefined;
    throw new Error(
      `${CODEC_ERROR_MESSAGE} ${JSON.stringify(errorPaths, null, 2)}${
        customError ?? ''
      }`,
    );
  }

  // Return the decoded codec
  return decoded.right;
}
