import { expect } from 'chai';
import { aggregateObjects } from '../aggregateObjects';

describe.only('aggregateObjects', () => {
  it('should return empty object for empty input array', () => {
    const result = aggregateObjects({ objs: [] });
    expect(result).to.deep.equal({});
  });

  it('should aggregate objects with same keys', () => {
    const objs = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
      { name: 'Bob', age: 35 },
    ];
    const result = aggregateObjects({ objs });
    expect(result).to.deep.equal({
      name: 'John,Jane,Bob',
      age: '30,25,35',
    });
  });

  it('should handle missing properties with missing keys', () => {
    const objs = [
      { name: 'John', age: 30 },
      { name: 'Jane' },
      { name: 'Bob', age: 35 },
    ];
    const result = aggregateObjects({ objs });
    expect(result).to.deep.equal({
      name: 'John,Jane,Bob',
      age: '30,,35',
    });
  });

  it('should handle null and undefined values', () => {
    const objs = [
      { name: 'John', age: null },
      { name: undefined, hobby: 'reading' },
      { name: 'Bob', hobby: null },
    ];
    const result = aggregateObjects({ objs });
    expect(result).to.deep.equal({
      name: 'John,,Bob',
      age: ',,',
      hobby: ',reading,',
    });
  });

  it('should wrap values in brackets when wrap option is true', () => {
    const objs = [
      { name: 'John', age: 30 },
      { name: 'Jane' },
      { name: 'Bob', age: 35 },
    ];
    const result = aggregateObjects({ objs, wrap: true });
    expect(result).to.deep.equal({
      name: '[John],[Jane],[Bob]',
      age: '[30],[],[35]',
    });
  });

  it('should handle objects with different keys', () => {
    const objs = [
      { name: 'John', age: 30 },
      { city: 'NY', country: 'USA' },
      { name: 'Bob', country: 'UK' },
    ];
    const result = aggregateObjects({ objs });
    expect(result).to.deep.equal({
      name: 'John,,Bob',
      age: '30,,',
      city: ',NY,',
      country: ',USA,UK',
    });
  });

  it('should handle empty objects', () => {
    const objs = [{ name: 'John' }, {}, { name: 'Bob' }];
    const result = aggregateObjects({ objs });
    expect(result).to.deep.equal({
      name: 'John,,Bob',
    });
  });

  it('should handle array with null or undefined objects', () => {
    const objs = [{ name: 'John' }, null, undefined, { name: 'Bob' }];
    const result = aggregateObjects({ objs });
    expect(result).to.deep.equal({
      name: 'John,,,Bob',
    });
  });

  it('should handle numeric and boolean values', () => {
    const objs = [
      { count: 1, active: true },
      { count: 2, active: false },
      { count: 3, active: true },
    ];
    const result = aggregateObjects({ objs });
    expect(result).to.deep.equal({
      count: '1,2,3',
      active: 'true,false,true',
    });
  });
});
