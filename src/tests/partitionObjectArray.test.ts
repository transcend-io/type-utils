import { expect } from 'chai';
import { partitionObjectArray } from '../partitionObjectArray';

describe('partitionObjectArray', () => {
  it('should handle empty array', () => {
    const result = partitionObjectArray([], ['id', 'name']);
    expect(result).to.deep.equal({});
  });

  it('should extract multiple properties from array of objects', () => {
    const items = [
      { id: 1, name: 'John', age: 25, city: 'NY' },
      { id: 2, name: 'Jane', age: 30, city: 'LA' },
    ];
    const result = partitionObjectArray(items, ['id', 'name']);
    expect(result).to.deep.equal({
      id: [1, 2],
      name: ['John', 'Jane'],
      rest: [
        { age: 25, city: 'NY' },
        { age: 30, city: 'LA' },
      ],
    });
  });

  it('should handle objects with missing properties', () => {
    const items = [
      { id: 1, name: 'John', age: 25 },
      { id: 2, age: 30 },
      { id: 3, name: 'Bob', city: 'LA' },
    ];
    const result = partitionObjectArray(items, ['id', 'name']);
    expect(result).to.deep.equal({
      id: [1, 2, 3],
      name: ['John', undefined, 'Bob'],
      rest: [{ age: 25 }, { age: 30 }, { city: 'LA' }],
    });
  });

  it('should handle different value types', () => {
    const items = [
      { id: 1, active: true, count: 10, tags: ['a', 'b'] },
      { id: 2, active: false, count: 20, tags: ['c'] },
    ];
    const result = partitionObjectArray(items, ['active', 'tags']);
    expect(result).to.deep.equal({
      active: [true, false],
      tags: [['a', 'b'], ['c']],
      rest: [
        { id: 1, count: 10 },
        { id: 2, count: 20 },
      ],
    });
  });

  it('should handle extracting all properties (empty rest)', () => {
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ];
    const result = partitionObjectArray(items, ['id', 'name']);
    expect(result).to.deep.equal({
      id: [1, 2],
      name: ['John', 'Jane'],
      rest: [{}, {}],
    });
  });

  it('should handle extracting no properties (everything in rest)', () => {
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ];
    const result = partitionObjectArray(items, []);
    expect(result).to.deep.equal({
      rest: [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ],
    });
  });

  it('should handle objects with null or undefined values', () => {
    const items = [
      { id: 1, name: null, age: 25 },
      { id: 2, name: undefined, age: 30 },
    ];
    const result = partitionObjectArray(items, ['id', 'name']);
    expect(result).to.deep.equal({
      id: [1, 2],
      name: [null, undefined],
      rest: [{ age: 25 }, { age: 30 }],
    });
  });

  it('should handle nested objects', () => {
    const items = [
      { id: 1, user: { name: 'John', age: 25 } },
      { id: 2, user: { name: 'Jane', age: 30 } },
    ];
    const result = partitionObjectArray(items, ['id', 'user']);
    expect(result).to.deep.equal({
      id: [1, 2],
      user: [
        { name: 'John', age: 25 },
        { name: 'Jane', age: 30 },
      ],
      rest: [{}, {}],
    });
  });

  it('should preserve property order in rest object', () => {
    const items = [
      { a: 1, b: 2, c: 3, d: 4 },
      { a: 5, b: 6, c: 7, d: 8 },
    ];
    const result = partitionObjectArray(items, ['a', 'c']);
    expect(result).to.deep.equal({
      a: [1, 5],
      c: [3, 7],
      rest: [
        { b: 2, d: 4 },
        { b: 6, d: 8 },
      ],
    });
  });
});
