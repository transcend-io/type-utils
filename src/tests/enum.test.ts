// external
import { expect } from 'chai';

// global
import { createEnum } from '../enum';

describe('Enum', () => {
  const enumVar = createEnum({
    my: 'my',
    property: 'property',
  });

  it('should index a property that exists', () => {
    expect(enumVar.my).equals('my');
    expect(enumVar.property).equals('property');
  });

  it('should allow iteration over keys', () => {
    expect(Object.keys(enumVar)).deep.equal(['my', 'property']);
  });

  it('should allow iteration over values', () => {
    expect(Object.values(enumVar)).deep.equal(['my', 'property']);
  });
});
