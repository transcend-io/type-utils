import { expect } from 'chai';
import { transposeObjectArray } from '../transposeObjectArray';

describe('transposeObjectArray', () => {
  it('should handle empty array', () => {
    const result = transposeObjectArray({objects: [], properties: ['id', 'name']});
    expect(result).to.deep.equal({});
  });

  it('should extract multiple properties from array of objects', () => {
    const objects = [
      { id: 1, name: 'John', age: 25, city: 'NY' },
      { id: 2, name: 'Jane', age: 30, city: 'LA' },
    ];
    const result = transposeObjectArray({objects, properties: ['id', 'name']});
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
    const objects = [
      { id: 1, name: 'John', age: 25 },
      { id: 2, age: 30 },
      { id: 3, name: 'Bob', city: 'LA' },
    ];
    const result = transposeObjectArray({objects, properties: ['id', 'name']});
    expect(result).to.deep.equal({
      id: [1, 2, 3],
      name: ['John', undefined, 'Bob'],
      rest: [{ age: 25 }, { age: 30 }, { city: 'LA' }],
    });
  });

  it('should handle different value types', () => {
    const objects = [
      { id: 1, active: true, count: 10, tags: ['a', 'b'] },
      { id: 2, active: false, count: 20, tags: ['c'] },
    ];
    const result = transposeObjectArray({objects, properties: ['active', 'tags']});
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
    const objects = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ];
    const result = transposeObjectArray({objects, properties: ['id', 'name']});
    expect(result).to.deep.equal({
      id: [1, 2],
      name: ['John', 'Jane'],
      rest: [{}, {}],
    });
  });

  it('should handle extracting no properties (everything in rest)', () => {
    const objects = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ];
    const result = transposeObjectArray({objects, properties: []});
    expect(result).to.deep.equal({
      rest: [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ],
    });
  });

  it('should handle objects with null or undefined values', () => {
    const objects = [
      { id: 1, name: null, age: 25 },
      { id: 2, name: undefined, age: 30 },
    ];
    const result = transposeObjectArray({objects, properties: ['id', 'name']});
    expect(result).to.deep.equal({
      id: [1, 2],
      name: [null, undefined],
      rest: [{ age: 25 }, { age: 30 }],
    });
  });

  it('should handle nested objects', () => {
    const objects = [
      { id: 1, user: { name: 'John', age: 25 } },
      { id: 2, user: { name: 'Jane', age: 30 } },
    ];
    const result = transposeObjectArray({objects, properties: ['id', 'user']});
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
    const objects = [
      { a: 1, b: 2, c: 3, d: 4 },
      { a: 5, b: 6, c: 7, d: 8 },
    ];
    const result = transposeObjectArray({objects, properties: ['a', 'c']});
    expect(result).to.deep.equal({
      a: [1, 5],
      c: [3, 7],
      rest: [
        { b: 2, d: 4 },
        { b: 6, d: 8 },
      ],
    });
  });

  it('should omit rest properties if includeOtherProperties is false', () => {
    const objects = [
      { id: 1, name: null, age: 25 },
      { id: 2, name: undefined, age: 30 },
    ];
    const result = transposeObjectArray({objects, properties: ['id', 'name'], options: {includeOtherProperties: false}});
    expect(result).to.deep.equal({
      id: [1, 2],
      name: [null, undefined],
    });
  });
});
