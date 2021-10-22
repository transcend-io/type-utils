// external
import { expect } from 'chai';
import * as t from 'io-ts';

// global
import { decodeCodec, FixedLengthArray } from '../codecTools';

describe('FixedLengthArray', () => {
  const TwoItemArray = FixedLengthArray(2, 2, t.number);

  it('decode a fixed length array successfully', () => {
    expect(() => decodeCodec(TwoItemArray, [1, 2])).to.not.throw();
  });

  it('error if the array does not have the expected length', () => {
    expect(() => decodeCodec(TwoItemArray, [1, 2, 3])).to.throw();
  });
});
