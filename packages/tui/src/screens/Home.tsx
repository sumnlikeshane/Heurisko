// Composition adapted from revision-7 Home; every row comes from a validated local observation.
import React from 'react';
import {Box,Text} from 'ink';
import {Panel,Row,Divider,StatusRow} from '../components/Panel.js';
import {ActionButton} from './TargetForm.js';
import {ProgressBar} from '../components/Progress.js';
import {fit,wrap} from '../terminal/safe-text.js';
import {color,type Theme} from '../tokens.js';
import type {RecentReport} from '../view-model.js';
export function Home({columns,height,theme,focus,index,attentionIndex,records,query,loading,active=true}:{columns:number;height:number;theme:Theme;focus:number;index:number;attentionIndex:number;records:RecentReport[];query:string;active?:boolean;loading?:{completed:number;total:number}}){
 const width=columns-4,narrow=columns<100||height<17,attention=records.filter(x=>x.validated&&x.status!=='Complete scope'),selected=records[Math.min(index,Math.max(0,records.length-1))];
 function list(w:number,h:number){const max=Math.max(1,Math.min(8,h-10)),start=Math.max(0,index-max+1),statusWidth=Math.min(16,Math.floor(w*.35));return <>
  <Row width={w} theme={theme} tone="muted">{query?'Filter: '+query:'PACKAGE / EXACT VERSION'}</Row>
  {!records.length&&<Row width={w} theme={theme} tone="muted">{loading?'Reading the saved index…':query?'No observations match this filter.':'No indexed reports. o opens a report path.'}</Row>}
  {records.slice(start,start+max).map((r,i)=><Box key={r.ref} width={w} height={1} flexShrink={0} backgroundColor={start+i===index?color(theme,'selection'):undefined}>
    <Text color={color(theme,start+i===index?'accent':'foreground')} bold={start+i===index}>{fit(`${start+i===index?(active&&focus===1?'>':'*'):' '} ${r.label}`,w-statusWidth,theme.ascii)}</Text><Text color={color(theme,r.tone??'muted')}>{fit(r.status,statusWidth,theme.ascii)}</Text>
   </Box>)}
  {selected&&<><Box height={1}/><Divider width={w} label="Selected investigation" theme={theme}/><Row width={w} theme={theme} bold>{selected.label}</Row>{wrap(selected.preview,w).slice(0,2).map((l,i)=><Row key={i} width={w} theme={theme}>{l}</Row>)}<Row width={w} theme={theme} tone="muted">{`Source ${selected.source??'Unknown'} / AI ${selected.ai??'Unknown'}`}</Row><Row width={w} theme={theme} tone="muted">{`Captured ${selected.capturedAt??'Not recorded'}`}</Row></>}
 </>;}
 function monitor(w:number){return <><StatusRow label="Runner" status="Not configured" width={w} theme={theme}/><StatusRow label="Last check" status="Not recorded" width={w} theme={theme}/><StatusRow label="Freshness" status="Unknown" width={w} theme={theme}/></>;}
 function needs(w:number,h:number){return <>{!attention.length?<Row width={w} theme={theme} tone="muted">No incomplete report indexed. Job history unavailable.</Row>:attention.slice(0,Math.max(1,h-5)).map((r,i)=><Row key={r.ref} width={w} theme={theme} tone="warning" selected={i===attentionIndex}>{(i===attentionIndex?(active&&focus===2?'> ':'* '):'  ')+r.label+' / '+r.status}</Row>)}<Box flexGrow={1}/><Row width={w} theme={theme} tone="muted">Inspect recorded scope; no safety verdict.</Row></>;}
 if(narrow){const titles=['Home','Recent investigations','Needs attention','Monitoring'];return <Panel title={titles[focus]??'Home'} meta={`${focus+1}/4`} width={width} height={Math.min(height,focus===0?12:height)} focused={active} theme={theme}>
  {focus===0?<><Box height={1}/><ActionButton label="New investigation" focused={active} width={Math.min(26,width-4)} theme={theme}/><Row width={width-4} theme={theme} tone="muted">npm package / local archive</Row><Box height={1}/><StatusRow label="Recent investigations" status={`${records.length} indexed`} width={width-4} theme={theme}/><StatusRow label="Needs attention" status={`${attention.length} incomplete`} width={width-4} theme={theme}/><StatusRow label="Monitoring" status="Not configured" width={width-4} theme={theme}/></>:focus===1?list(width-4,height):focus===2?needs(width-4,height):monitor(width-4)}
  {loading&&<ProgressBar width={width-4} theme={theme} completed={loading.completed} total={loading.total} label="Reading reports"/>}
 </Panel>;}
 const left=Math.floor((width-1)*.64),right=width-left-1,h=Math.min(height-3,22),monitorHeight=6;
 return <><Box height={1} gap={2}><ActionButton label="New investigation" focused={active&&focus===0} width={26} theme={theme}/><Row width={width-28} theme={theme} tone="muted">npm package / local archive  ·  o Open saved report</Row></Box><Box height={1}/><Box gap={1}>
  <Panel title="Recent investigations" meta={`${records.length} indexed`} width={left} height={h} focused={active&&focus===1} theme={theme}>{list(left-4,h)}{loading&&<ProgressBar width={left-4} theme={theme} completed={loading.completed} total={loading.total} label="Reading reports"/>}</Panel>
  <Box width={right} flexDirection="column"><Panel title="Monitoring" width={right} height={monitorHeight} focused={active&&focus===3} theme={theme}>{monitor(right-4)}</Panel><Box height={1}/><Panel title="Needs attention" meta={String(attention.length)} width={right} height={h-monitorHeight-1} focused={active&&focus===2} theme={theme}>{needs(right-4,h-monitorHeight-1)}</Panel></Box>
 </Box></>;
}
