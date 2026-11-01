import React,{useEffect,useState} from 'react';
import {Box} from 'ink';
import {Panel,Row,StatusRow,Divider} from '../components/Panel.js';
import {ProgressBar,elapsedLabel} from '../components/Progress.js';
import {DocumentPane,type Line} from '../components/DocumentPane.js';
import {stages} from '../../../../integration/part4/dist/report-reader.js';
import type {TaskSnapshot} from '../../../../integration/part4/dist/investigation-task.js';
import type {Theme,Tone} from '../tokens.js';
export function currentStageIndex(snapshot?:Readonly<TaskSnapshot>){const running=snapshot?.events.filter(e=>e.status==='running').at(-1);return running?Math.max(0,stages.indexOf(running.stage)):0;}
export function Live({columns,height,theme,snapshot,selected,focus,scroll,started}:{columns:number;height:number;theme:Theme;snapshot?:Readonly<TaskSnapshot>;selected?:number;focus:number;scroll:number;started:number}){
 const [now,setNow]=useState(Date.now());useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
 const width=columns-4,index=selected??currentStageIndex(snapshot),stage=stages[index]!,event=snapshot?.events.filter(e=>e.stage===stage).at(-1),latest=snapshot?.events.at(-1),done=stages.filter(s=>{const last=snapshot?.events.filter(e=>e.stage===s).at(-1);return last&&['complete','incomplete','failed','skipped'].includes(last.status);}).length;
 const cancellation=snapshot?.cancellationRequested,active=snapshot?.phase!=='settled_report'&&snapshot?.phase!=='settled_error';
 const stateTone=(s?:string):Tone=>s==='failed'?'error':s==='incomplete'?'warning':s==='running'?'accent':s==='complete'?'foreground':'muted';
 const details:Line[]=[{text:cancellation?'Cancellation requested — awaiting engine settlement.':'Investigation in progress',bold:true,tone:cancellation?'warning':'accent'},
  {text:'Stage execution is not a security verdict.'},{text:''},{text:'Selected stage',bold:true},{text:stage},{text:`Status: ${event?.status??'not_started'}`,tone:stateTone(event?.status)},
  ...(event?.errors?.length?event.errors.flatMap(e=>[{text:e.code,bold:true,tone:'error' as const},{text:e.message},{text:'Affected scope: '+e.affectedScope}]):[{text:'No diagnostic event recorded for this stage.',tone:'muted' as const}]),
  {text:''},{text:'Available evidence',bold:true},{text:'Live evidence references are unavailable. The settled report preserves its recorded scope.'},
  {text:''},{text:'Recent activity',bold:true},...(snapshot?.events.slice(-7).map(e=>({text:`${e.stage.replaceAll('_',' ')} / ${e.status}`,tone:stateTone(e.status)}))??[]),
  {text:''},{text:`${snapshot?.omittedEvents??0} earlier events omitted from this bounded event history.`,tone:'muted'},
  {text:'Cancellation requests do not acknowledge cleanup. Detach and retry are unavailable.',tone:'muted'}];
 const stageList=(w:number,h:number)=><Panel title="Stages" meta={`${done}/10 terminal facts`} focused={focus===0} width={w} height={Math.min(h,14)} theme={theme}>{stages.map((s,i)=>{const last=snapshot?.events.filter(e=>e.stage===s).at(-1);return <Row key={s} width={w-4} theme={theme} selected={i===index} tone={stateTone(last?.status)}>{`${i===index?'> ':'  '}${s.replaceAll('_',' ')} / ${last?.status??'not_started'}`}</Row>;})}<Row width={w-4} theme={theme} tone="muted">Complete / incomplete / skipped / failed stay distinct.</Row></Panel>;
 return <Box width={width} height={height} flexDirection="column">
 <Row width={width} theme={theme} bold>{cancellation?'Stopping investigation':'Live investigation'}</Row>
 <Row width={width} theme={theme} tone="muted">{`${elapsedLabel(started,now)} · ${done}/10 stages reported terminal facts · no estimated finish time`}</Row>
 <ProgressBar width={width} theme={theme} label={cancellation?'Waiting for settlement':(latest?.stage??'Preparing').replaceAll('_',' ')} completed={latest?.completedUnits} total={latest?.totalUnits} active={active}/>
 <Box height={1}/>
 {columns<100?(focus===0?stageList(width,height-4):<DocumentPane title={`${stage.replaceAll('_',' ')} / diagnostics`} lines={details} width={width} height={height-4} scroll={scroll} focused theme={theme}/>):<Box gap={1}>{stageList(Math.max(36,Math.floor(width*.35)),height-4)}<DocumentPane title="Stage details & activity" lines={details} width={width-Math.max(36,Math.floor(width*.35))-1} height={height-4} scroll={scroll} focused={focus===1} theme={theme}/></Box>}
 </Box>;
}
