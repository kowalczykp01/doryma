const BASE = [
  '#ff5d73', '#ffb84d', '#4dd6c4', '#8c7bff', '#7ed957', '#ff8ad8', '#4dabff', '#ffe066',
  '#ff8f4d', '#b5f2ff', '#e0a3ff', '#a3ffcf', '#ff6b6b', '#c4e15a', '#ffc9a3', '#7fb2ff',
];

/** A whole song can use more patterns than the base palette; further colors spread hues by the golden angle. */
export const paletteColor = (index: number): string =>
  BASE[index] ?? `hsl(${Math.round((index * 137.508) % 360)} 75% 68%)`;
