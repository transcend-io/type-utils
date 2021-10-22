/**
 * Identify if a string is an interface
 */
export const INTERFACE_REGEX =
  /(interface|type|input) [a-zA-Z0-9]* (implements .+?|){([\s\S]+?)}/;

/**
 * A gql is simply a string but enforced to be some underlying type
 */
export type Gql<TGraphQLType extends object> = string & {
  /** The typescript type definition that relates to the gql */
  graphQLType: TGraphQLType;
};

/**
 * Create a gql tag. This may one day be replaced by apollo graphql-tag.
 * I like being able to create un-named fragments that can be constructed into a graphql statement.
 * It is nice to wrap the fragment in a gql tag to get editor highlighting, however the need to co-localize each fragment definition with the
 * resulting graphql statement is a pain, and thus why graphql-tag is not used.
 *
 * @param strings - The template string
 * @param expressions - The expressions injected into the template
 * @returns The gql string that was the inputs
 */
export function gql<TGraphQLType extends object>(
  strings: TemplateStringsArray,
  ...expressions: (string | number)[]
): Gql<TGraphQLType> {
  // If there are no expressions included in the literal
  if (expressions.length === 0) {
    return strings[0] as Gql<TGraphQLType>;
  }
  const n = strings.length - 1;
  let result = '';
  for (let i = 0; i < n; i += 1) {
    const expression = expressions[i];
    // Get properties from an interface
    const useExpression = INTERFACE_REGEX.test(
      typeof expression === 'string' ? expression : expression.toString(),
    )
      ? (INTERFACE_REGEX.exec(
          typeof expression === 'string' ? expression : expression.toString(),
        ) || [])[3]
      : expression;
    result += strings[i] + useExpression;
  }
  result += strings[n];
  return result as Gql<TGraphQLType>;
}
