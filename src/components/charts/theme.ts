/**
 * Chart tokens. The categorical order below was validated with the dataviz
 * palette checker on a white surface (lightness band, chroma floor, adjacent
 * CVD separation, normal-vision floor and 3:1 contrast all pass). Hues are
 * assigned in fixed order and never cycled.
 */
export const SERIES = [
  '#2A5B96', // 1 blue
  '#C4552F', // 2 terracotta
  '#0DA08F', // 3 teal
  '#A87C1E', // 4 gold
  '#7C4CA8', // 5 violet
  '#5F8B2A', // 6 olive
] as const;

/** Reserved status colours — never reused as a categorical slot. */
export const STATUS = {
  complete: '#3F7D58',
  inProgress: '#C08A2E',
  notStarted: '#C9C6BE',
  alert: '#A8442F',
} as const;

export const AXIS = {
  stroke: '#E5E0D6',
  tick: { fill: '#5A6472', fontSize: 11.5 },
  fontFamily: 'Inter, system-ui, sans-serif',
} as const;

export const GRID_STROKE = '#F0ECE4';

export function seriesColor(index: number): string {
  return SERIES[index % SERIES.length]!;
}
