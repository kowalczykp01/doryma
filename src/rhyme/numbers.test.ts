import { describe, expect, it } from 'vitest';
import { cardinal, NUMBER, readNumber } from './numbers';

const read = (text: string) => [...text.matchAll(NUMBER)].map(readNumber);

describe('cardinal', () => {
  it('P-04: reads cardinal numbers in the nominative', () => {
    expect(cardinal(0)).toBe('zero');
    expect(cardinal(7)).toBe('siedem');
    expect(cardinal(16)).toBe('szesnaście');
    expect(cardinal(40)).toBe('czterdzieści');
    expect(cardinal(97)).toBe('dziewięćdziesiąt siedem');
    expect(cardinal(200)).toBe('dwieście');
    expect(cardinal(1000)).toBe('tysiąc');
    expect(cardinal(1997)).toBe('tysiąc dziewięćset dziewięćdziesiąt siedem');
    expect(cardinal(2005)).toBe('dwa tysiące pięć');
    expect(cardinal(5000)).toBe('pięć tysięcy');
    expect(cardinal(12000)).toBe('dwanaście tysięcy');
    expect(cardinal(22000)).toBe('dwadzieścia dwa tysiące');
    expect(cardinal(1000000)).toBe('milion');
    expect(cardinal(3500000)).toBe('trzy miliony pięćset tysięcy');
  });
});

describe('NUMBER', () => {
  it('P-04: reads standalone numbers, leading zeros digit by digit', () => {
    expect(read('mam 20 lat i 007 w kieszeni')).toEqual(['dwadzieścia', 'zero zero siedem']);
    expect(read('to już 1 000 000 odsłon')).toEqual(['milion']);
  });

  it('P-05: reads times, decimals, percent and złoty', () => {
    expect(read('o 16:30 i o 7:05 i o 21:00')).toEqual(['szesnasta trzydzieści', 'siódma zero pięć', 'dwudziesta pierwsza']);
    expect(read('2,5 promila')).toEqual(['dwa przecinek pięć']);
    expect(read('daję 100% i 110 %')).toEqual(['sto procent', 'sto dziesięć procent']);
    expect(read('1 zł, 2 zł, 5 zł, 22 zł, 12zł')).toEqual([
      'jeden złoty',
      'dwa złote',
      'pięć złotych',
      'dwadzieścia dwa złote',
      'dwanaście złotych',
    ]);
    expect(read('2,50 zł')).toEqual(['dwa złote pięćdziesiąt']);
  });

  it('P-06: leaves numbers glued to letters for a pronunciation annotation', () => {
    expect(read('słucham 2pac i jeżdżę S500, 4x szybciej')).toEqual([]);
  });
});
