/**
 * The full match returned when regex.exec finds a match
 */
export interface RegExpMatch {
  /** The full regex match */
  fullMatch: string;
  /** The index in the text where the match was found */
  matchIndex: number;
  /** When a strict regex is provided, check if the regex matches the strict standard */
  isStrict?: boolean;
}

/**
 * Use a regex with the 'g' global flag to list all items in a file. Can then map the matches back to object parameters
 */
export interface FindAllRegExp<TMatchKeys extends string> {
  /** The regex to test */
  value: RegExp;
  /**
   * A RegExp that is stricter than `value` and can be used to test if the definition matches a certain standard.
   *
   * i.e. I may have a loose match for jsdoc properties but I want a stricter standard for linting them
   */
  strict?: RegExp;
  /**
   * The match groups in the regex will map to these object attributes.
   * If there are more match groups than matches, an error is thrown
   */
  matches: TMatchKeys[];
  /** When true, skip validation of matches being the expected length */
  skipMatchValidation?: boolean;
}

/**
 * Use a regex with the global flag to find all matches and return the list of matches with match groups mapped to parameter names
 * @param regex - The regex definition and match attributes
 * @param text - The text to find all in
 * @returns The matches all converted to type T
 */
export function findAllWithRegex<TMatchKeys extends string>(
  regex: FindAllRegExp<TMatchKeys>,
  text: string,
): ({ [k in TMatchKeys]: string } & RegExpMatch)[] {
  // Validate the parameters
  if (!regex.value.flags.includes('g')) {
    throw new Error('Regex.value must have a g flag');
  }

  // The name of the match groups
  const matchParams = ['fullMatch', ...regex.matches];

  // The results
  const results: ({ [k in TMatchKeys]: string } & RegExpMatch)[] = [];

  // Check for initial match
  let match = regex.value.exec(text);
  let i = 0;

  // Loop over all matches
  while (match) {
    // Ensure that each match is accounted for
    if (matchParams.length !== match.length && !regex.skipMatchValidation) {
      throw new Error(
        `Mismatch in match length at index [${i}]: "${match.length}" vs expected: "${matchParams.length}"`,
      );
    }

    // Construct the match result and assert it is of type T & RegExpMatch
    const result = match.reduce(
      (acc, matchResult, ind) =>
        Object.assign(acc, { [matchParams[ind]]: matchResult }),
      {},
    ) as { [k in TMatchKeys]: string } & RegExpMatch;

    // Save the index
    result.matchIndex = match.index;

    // Test if the strict regex passes
    if (regex.strict) {
      result.isStrict = regex.strict.test(result.fullMatch);
    }

    // Save the result
    results.push(result);

    // Check for another
    match = regex.value.exec(text);
    i += 1;

    // FIXME
    console.log('TEST')
  }

  return results;
}
