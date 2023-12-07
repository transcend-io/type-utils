// external
import { fold } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import * as t from 'io-ts';

// Determine the paths of the codec that are invalid
const getPaths = <A>(v: t.Validation<A>): string[] =>
  pipe(
    v,
    fold(
      (errors) =>
        errors.map((error) => {
          const lastError = error.context[error.context.length - 1];
          return `${error.context
            .map((context) => context.key)
            // Note: lastError.actual is helpful for debugging
            .join('.')} expected type '${lastError.type.name}'`;
        }),

      () => ['no errors'],
    ),
  );

// Get custom error messages for the errors
const getCustomErrors = <A>(
  v: t.Validation<A>,
  customErrorFromContext: (validationContext: t.Context) => string,
): string[] =>
  pipe(
    v,
    fold(
      (errors) => errors.map((error) => customErrorFromContext(error.context)),
      () => ['no errors'],
    ),
  );

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
  // Warning: DO NOT LOG SENSITIVE DATA WITH THIS!
  customErrorFromContext: (validationContext: t.Context) => string = () => '',
): t.TypeOf<TCodec> {
  // uncomment the below to view the response pre-decode
  const decoded = codec.decode(
    parse && typeof txt === 'string' ? JSON.parse(txt) : txt,
  );
  // Log errors on failure
  // eslint-disable-next-line no-underscore-dangle
  if (decoded._tag === 'Left') {
    throw new Error(
      `${CODEC_ERROR_MESSAGE} \n\n${JSON.stringify(
        getPaths(decoded),
        null,
        2,
      )}${JSON.stringify(
        getCustomErrors(decoded, customErrorFromContext),
        null,
        2,
      )}`,
    );
  }

  // Return the decoded codec
  return decoded.right;
}
