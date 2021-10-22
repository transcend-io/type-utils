// external
import { expect } from 'chai';

// global
import { gql, Gql } from '../gql';

describe('gql', () => {
  it('should compile a template with no expressions', () => {
    expect(gql`This is a test`).equals('This is a test');
  });

  it('should compile a template with expressions', () => {
    /** Data subject */
    type DataSubjectInterface = {
      /** ID */
      id: string;
    };
    const interfaceType = gql`
      """
      A classification of data subjects that the organization may have
      """
      interface DataSubjectInterface {
        """
        This is an id
        """
        id: ID
      }
    ` as Gql<DataSubjectInterface>;
    const typeType = gql`
      """ The internal configuration for a data subject """
      type DataSubjectInternal implements DataSubjectInterface {
        ${interfaceType}
        """ Whether the data subject is currently turned on """
        active: Boolean!,
      }
    `;
    expect(typeType).equals(
      `
      """ The internal configuration for a data subject """
      type DataSubjectInternal implements DataSubjectInterface {
${'        '}
        """
        This is an id
        """
        id: ID
${'      '}
        """ Whether the data subject is currently turned on """
        active: Boolean!,
      }
    `,
    );
  });
});
