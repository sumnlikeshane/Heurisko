// Proposed revision 4: neutral near-black canvas, brighter functional accents.
export const colors = {
  background:'#080808', surface:'#111111', foreground:'#f0f0f0', muted:'#a3a3a3',
  border:'#494949', focus:'#51d6cf', accent:'#51d6cf', selection:'#252525',
  warning:'#ffc66b', error:'#ff777f', positive:'#7de2a2',
} as const;
export type Tone='foreground'|'muted'|'accent'|'warning'|'error'|'positive'|'focus';
export type Theme={ascii:boolean;noColor:boolean;palette:boolean};
const palette={background:'black',surface:'black',foreground:'white',muted:'gray',border:'gray',focus:'cyan',accent:'cyan',selection:'black',warning:'yellow',error:'red',positive:'green'};
export function color(theme:Theme,token:keyof typeof colors):string|undefined {
  return theme.noColor?undefined:theme.palette?palette[token]:colors[token];
}
export const space={page:2,paneGap:1,inset:1} as const;
