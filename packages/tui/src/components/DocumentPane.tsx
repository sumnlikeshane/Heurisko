import React,{useMemo} from 'react';
import {Box} from 'ink';
import {Panel,Row} from './Panel.js';
import {wrap,fit,safeText} from '../terminal/safe-text.js';
import type {Theme,Tone} from '../tokens.js';
export type Line={text:string;tone?:Tone;bold?:boolean;raw?:boolean;left?:string;right?:string;leftTone?:Tone;rightTone?:Tone};
export function documentLines(lines:readonly (Line|string)[],width:number):Line[]{
 return lines.flatMap(value=>{const l=typeof value==='string'?{text:value}:value;return l.raw?[{...l,text:fit(l.text,width)}]:wrap(l.text,Math.max(1,width)).map(text=>({...l,text}));});
}
export function DocumentPane({title,lines,scroll,width,height,focused=true,theme,fill=false}:{title:string;lines:readonly (Line|string)[];scroll:number;width:number;height:number;focused?:boolean;theme:Theme;fill?:boolean}){
 // App projections may allocate equivalent rows on scroll/focus changes. Avoid
 // rewrapping every retained paragraph/byte row for each navigation keystroke.
 const inner=Math.max(1,width-4),signature=JSON.stringify(lines),all=useMemo(()=>documentLines(lines,inner),[signature,inner]),panelHeight=fill?height:Math.min(height,Math.max(6,all.length+3)),capacity=Math.max(1,panelHeight-3),offset=Math.max(0,Math.min(scroll,Math.max(0,all.length-capacity)));
 return <Panel title={title} focused={focused} width={width} height={panelHeight} theme={theme}>
 {all.slice(offset,offset+capacity).map((l,i)=>l.left!==undefined?<Box key={i} height={1} flexShrink={0}><Row width={Math.floor((inner-3)/2)} theme={theme} tone={l.leftTone}>{l.left}</Row><Row width={3} theme={theme} tone="muted">{' | '}</Row><Row width={Math.floor((inner-3)/2)} theme={theme} tone={l.rightTone}>{l.right??''}</Row></Box>:<Row key={i} width={inner} theme={theme} tone={l.tone} bold={l.bold}>{l.text}</Row>)}
 <Box flexGrow={1}/><Row width={inner} theme={theme} tone="muted">{`${all.length?offset+1:0}-${Math.min(all.length,offset+capacity)} / ${all.length}${all.length>capacity?'  j/k scroll':''}`}</Row>
 </Panel>;
}
