import { expect } from 'chai';
import * as t from 'io-ts';
import { decodeCodec } from '../codecTools';

describe('decodeCodec', () => {
  it('should decode a codec as expected', () => {
    const c = t.type({
      str: t.string,
      num: t.number,
      headers: t.record(t.string, t.string),
    });
    const obj = {
      str: 'abcd',
      num: 123,
      headers: {
        yolo: 'one-life',
      },
    };
    const decoded = decodeCodec(c, obj);
    expect(decoded).to.deep.equal(obj);
  });

  it('should throw an error when the input does not match the codec', () => {
    const c = t.type({
      str: t.string,
      num: t.number,
      headers: t.record(t.string, t.string),
    });
    const obj = {
      str: 123,
      num: 123,
      headers: {
        yolo: 'one-life',
      },
    };
    try {
      decodeCodec(c, obj);
    } catch (e: any) {
      expect(e.message).to.equal(
        'Failed to decode codec: [\n  ".str expected type \'string\'"\n]',
      );
    }
  });
});
