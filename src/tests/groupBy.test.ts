// external
import { expect } from 'chai';

// global
import { groupBy } from '../groupBy';

/** A fake object type to group by */
interface ExampleObj {
  /** an example param */
  a: string;
}

describe('groupBy', () => {
  it('should group by a given key', () => {
    const expected = new Map<string, ExampleObj[]>();
    expected.set('foo', [{ a: 'foo' }, { a: 'foo' }]);
    expected.set('bar', [{ a: 'bar' }]);

    expect(
      groupBy([{ a: 'foo' }, { a: 'bar' }, { a: 'foo' }], ({ a }) => a),
    ).deep.equals(expected);
  });
});
