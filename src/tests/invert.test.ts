// external
import { expect } from 'chai';

// global
import { invert, invertSafe } from '../invert';

describe('invert', () => {
  it('should invert a string -> string object', () => {
    expect(
      invert({
        a: 'b',
        c: 'd',
        e: 'f',
      }),
    ).deep.equals({
      b: 'a',
      d: 'c',
      f: 'e',
    });
  });

  it('should throw an error when 1-1 invert is impossible', () => {
    expect(() =>
      invert({
        a: 'b',
        c: 'b',
        e: 'f',
      }),
    ).to.throw('Encountered duplicate value inverting object: "b: c and a"');
  });

  it('should invert a string -> string[] object', () => {
    expect(
      invert({
        a: ['b', 'd'],
        c: ['d', 'e'],
        e: ['f'],
      }),
    ).deep.equals({
      b: ['a'],
      d: ['a', 'c'],
      f: ['e'],
      e: ['c'],
    });
  });
});

describe('invertSafe', () => {
  it('should invert a string -> string[] object', () => {
    expect(
      invertSafe({
        a: 'b',
        c: 'd',
        e: 'f',
      }),
    ).deep.equals({
      b: ['a'],
      d: ['c'],
      f: ['e'],
    });
  });
});
