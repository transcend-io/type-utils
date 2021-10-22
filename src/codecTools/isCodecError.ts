/**
 * Checks the error message to see if it is an io-ts codec error
 *
 * @param err - The error obj
 * @returns whether it is a io-ts codec error
 */
export function isCodecError(err: Error): boolean {
  return err.message.startsWith('Failed to decode codec');
}
