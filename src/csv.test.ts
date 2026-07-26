import { describe, expect, it } from 'vitest';
import { escapeCsvCell, parseCsv, parseCsvLine } from './csv';

describe('CSV utilities', () => {
  it('parses quoted commas and escaped quotes', () => {
    expect(parseCsvLine('A,"上海,浦东","他说""好"""')).toEqual(['A', '上海,浦东', '他说"好"']);
  });

  it('maps rows to headers', () => {
    expect(parseCsv('name,amount\n纸舟,68000')).toEqual([{ name: '纸舟', amount: '68000' }]);
  });

  it('escapes cells safely', () => {
    expect(escapeCsvCell('上海,浦东')).toBe('"上海,浦东"');
    expect(escapeCsvCell('普通文本')).toBe('普通文本');
  });
});
