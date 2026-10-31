import React,{useEffect,useState} from 'react';
import {Box,Text} from 'ink';
import {color,type Theme} from '../tokens.js';
import {fit} from '../terminal/safe-text.js';
export function progressMeasure(completed?:number,total?:number){
 if(typeof completed!=='number'||typeof total!=='number'||!Number.isSafeInteger(completed)||!Number.isSafeInteger(total)||completed<0||total<=0||completed>total)return {kind:'indeterminate' as const};
 return {kind:'measured' as const,completed,total,fraction:completed/total};
}
export function ProgressBar({width,theme,completed,total,label='Working',active=true}:{width:number;theme:Theme;completed?:number;total?:number;label?:string;active?:boolean}){
 const [frame,setFrame]=useState(4);const measure=progressMeasure(completed,total);
 useEffect(()=>{if(!active||measure.kind==='measured')return;const timer=setInterval(()=>setFrame(v=>(v+1)%1000),120);return()=>clearInterval(timer);},[active,measure.kind]);
 const barWidth=Math.max(5,Math.min(32,Math.floor(width*.35))),filled=measure.kind==='measured'?Math.floor(barWidth*measure.fraction):0;
 const text=Array.from({length:barWidth},(_,i)=>measure.kind==='measured'?(i<filled?(theme.ascii?'#':'━'):(theme.ascii?'-':'─')):(active&&i>=frame%(barWidth+4)-4&&i<frame%(barWidth+4)?(theme.ascii?'#':'━'):(theme.ascii?'-':'─'))).join('');
 const status=measure.kind==='measured'?`${measure.completed}/${measure.total} ${Math.floor(measure.fraction*100)}%`:'indeterminate';
 return <Box height={1} flexShrink={0} width={width}><Text color={color(theme,active?'accent':'muted')}>{'['+text+'] '}</Text><Text color={color(theme,'foreground')}>{fit(`${label} / ${status}`,Math.max(0,width-barWidth-3),theme.ascii)}</Text></Box>;
}
export function elapsedLabel(start:number,now=Date.now()){const seconds=Math.max(0,Math.floor((now-start)/1000));return `${Math.floor(seconds/60)}m ${String(seconds%60).padStart(2,'0')}s elapsed`;}
