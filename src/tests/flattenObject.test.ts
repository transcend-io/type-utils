import { expect } from 'chai';
import { flattenObject } from '../flattenObject';

describe('flattenObject', () => {
  it('should return empty object for null input', () => {
    const result = flattenObject({ obj: null });
    expect(result).to.deep.equal({});
  });

  it('should return empty object for undefined input', () => {
    let obj;
    const result = flattenObject({ obj });
    expect(result).to.deep.equal({});
  });

  it('should flatten list of objects with some entries missing properties', () => {
    // create a list of users with one of them missiging the age property
    const obj = {
      users: [
        {
          name: 'Bob',
        },
        {
          name: 'Alice',
          age: 18,
        },
      ],
    };
    const result = flattenObject({ obj });
    // the flattened object should include the missing age property
    expect(result).to.deep.equal({
      users_name: 'Bob,Alice',
      users_age: ',18',
    });
  });

  it('should ignore primitive and null types within list containing objects', () => {
    // create a list of a mix of objects, strings, and null
    const obj = {
      users: [
        'example@domain.com',
        null,
        {
          name: 'Bob',
        },
        {
          name: 'Alice',
          age: 18,
        },
      ],
    };
    const result = flattenObject({ obj });
    // the flattened object should not include the strings
    expect(result).to.deep.equal({
      users_name: 'Bob,Alice',
      users_age: ',18',
    });
  });

  it('should flatten an object with null entries', () => {
    const obj = {
      user: {
        siblings: null,
      },
    };
    const result = flattenObject({ obj });
    expect(result).to.deep.equal({
      user_siblings: '',
    });
  });

  it('should flatten an object with empty entries', () => {
    const obj = {
      user: {
        siblings: [],
      },
    };
    const result = flattenObject({ obj });
    expect(result).to.deep.equal({
      user_siblings: '',
    });
  });

  it('should flatten a deep nested object', () => {
    const obj = {
      user: {
        name: 'John',
        address: {
          city: 'NY',
          zip: 10001,
        },
        hobbies: ['reading', 'gaming'],
        parents: [
          {
            name: 'Alice',
            biological: true,
            age: 52,
          },
          {
            name: 'Bob',
            biological: false,
          },
        ],
        siblings: [],
        grandParents: null,
      },
    };
    const result = flattenObject({ obj });
    expect(result).to.deep.equal({
      user_name: 'John',
      user_address_city: 'NY',
      user_address_zip: 10001,
      user_hobbies: 'reading,gaming',
      user_parents_name: 'Alice,Bob',
      user_parents_biological: 'true,false',
      user_parents_age: '52,',
      user_siblings: '',
      user_grandParents: '',
    });
  });
});
