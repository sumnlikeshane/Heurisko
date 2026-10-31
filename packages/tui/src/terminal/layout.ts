export const MIN_COLUMNS=60;
export const MIN_ROWS=20;
export function layout(columns:number,rows:number) {
  return {columns,rows, band:columns>=140?'wide':columns>=100?'medium':'narrow',
    usable:columns>=MIN_COLUMNS&&rows>=MIN_ROWS, contentHeight:Math.max(1,rows-8)} as const;
}
