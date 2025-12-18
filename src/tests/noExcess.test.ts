import { expect } from 'chai';
import * as t from 'io-ts';
import { noExcess } from '../noExcess';
import { decodeCodec } from '../codecTools';

describe('noExcess', () => {
  it('should decode a wrapped codec as expected', () => {
    const c = noExcess(t.type({
      str: t.string,
      num: t.number,
      headers: t.record(t.string, t.string),
    }));

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

  // Confirms default functionality without noExcess wrapper
  it('should not throw an error when unwrapped codec has an excess key', () => {
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
      extraKey: 'extraValue'
    }

    const decoded = decodeCodec(c, obj);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(decoded).to.deep.equal(obj);

  });

  it('should throw an error when noExcess wrapped codec has an excess key', () => {
    const c = noExcess(t.type({
      str: t.string,
      num: t.number,
      headers: t.record(t.string, t.string),
    }));

    const obj = {
      str: 'abcd',
      num: 123,
      headers: {
        yolo: 'one-life',
      },
      extraKey: 'extraValue'
    }
    try {
      decodeCodec(c, obj);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      expect(e.message).to.equal(
        `Failed to decode codec: [\n  " expected type '{| str: string, num: number, headers: { [K in string]: string } |}'"\n]`,
      );
    }
  });
});
