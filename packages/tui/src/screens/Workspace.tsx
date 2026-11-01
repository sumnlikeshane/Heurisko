// Revision-7 list/detail/evidence composition over real read-only model items.
import React from 'react';
import {Box} from 'ink';
import {Panel,Row} from '../components/Panel.js';
import {DocumentPane,type Line,documentLines} from '../components/DocumentPane.js';
import {wrap,fit} from '../terminal/safe-text.js';
import {workspaceLayout} from '../terminal/workspace-layout.js';
import type {Item} from '../model.js';
import type {Theme} from '../tokens.js';
export function structuredLines(lines:readonly string[]):Line[]{
 const out:Line[]=[];for(const text of lines){const at=text.indexOf(':');
  if(at>0&&at<32){if(out.length)out.push({text:''});out.push({text:text.slice(0,at+1),bold:true,tone:['Limitation','SOURCE CONFLICT','Significance'].some(s=>text.startsWith(s))?'warning':'foreground'},{text:text.slice(at+1).trim()});}
  else out.push({text,bold:text.startsWith('INTERPRETATION')||text.startsWith('RAW '),tone:text.startsWith('Metadata only')?'warning':undefined});
 }return out;
}
export function Workspace({columns,height,theme,title,subtitle,items,index,focus,scroll,scrolls,detail,query,refs,active=true,citation,detailLines,supportLines}:{columns:number;height:number;theme:Theme;title:string;subtitle:string;items:Item[];index:number;focus:number;scroll:number;scrolls:readonly number[];detail:boolean;query:string;refs:readonly string[];active?:boolean;citation:number;detailLines:Line[];supportLines:Line[]}){
 const width=columns-4,selected=items[Math.min(index,Math.max(0,items.length-1))],hasSupport=refs.length>0,isFiles=title==='Files',geometry=workspaceLayout(columns,height,focus,detail,isFiles,!hasSupport),paneHeight=geometry.height,inspector=detail,panes=detail?[1]:geometry.visible;

 if(!items.length)return <DocumentPane title={title} lines={detailLines} width={width} height={height} scroll={scroll} focused={active} theme={theme}/>;

 return <Box width={width} height={height} flexDirection="column"><Row width={width} theme={theme} bold>{title}</Row><Row width={width} theme={theme} tone={inspector?'accent':'muted'}>{inspector?`${title} > ${selected?.label??'No record'} / Esc restores position`:subtitle}</Row><Box gap={1}>
 {panes.map(pane=>{
  const w=inspector?width:geometry.widths[panes.indexOf(pane)]!;
  if(pane!==0)return <DocumentPane key={pane} title={pane===2?'Supporting evidence':isFiles&&selected?.directory?'Directory / navigation':inspector?selected?.label??title:title==='Findings'?'Observation & assessment':isFiles?'Raw source / artifact comparison':title+' details'} lines={pane===2?supportLines:detailLines} width={w} height={paneHeight} scroll={inspector?scroll:scrolls[pane]??0} focused={active&&(inspector||focus===pane)} theme={theme}/>;
  const inner=w-4,capacity=Math.max(1,paneHeight-3-(query?2:0)),rows=items.map(item=>({item,labels:isFiles?[fit(item.label,Math.max(1,inner-2))]:wrap(item.label,Math.max(1,inner-2)).slice(0,2),meta:item.meta}));
  const at=Math.min(index,Math.max(0,rows.length-1));let start=at,used=(rows[at]?.labels.length??0)+(rows[at]?.meta?1:0)+1;
  while(start>0){const r=rows[start-1]!,n=r.labels.length+(r.meta?1:0)+1;if(used+n>capacity)break;used+=n;start--;}
  const visible:typeof rows=[];used=0;for(const row of rows.slice(start)){const n=row.labels.length+(row.meta?1:0)+1;if(used+n>capacity)break;visible.push(row);used+=n;}
  const empty=detailLines[0]?.text??'No matching items.';const emptyRows=wrap(empty,inner);const ph=Math.min(paneHeight,Math.max(6,(items.length?used:emptyRows.length)+(query?2:0)+3));
  return <Panel key={pane} title={title==='Source'?'Source records':title} meta={items.length?String(items.length):query?'No match':'No records'} width={w} height={ph} theme={theme} focused={active&&focus===0}>
   {query&&<><Row width={inner} theme={theme} tone="muted">{'Filter: '+query}</Row><Box height={1}/></>}
   {!items.length?emptyRows.slice(0,ph-3).map((s,i)=><Row key={i} width={inner} theme={theme} tone="warning">{s}</Row>):visible.map(({item,labels,meta})=><Box key={item.id} flexDirection="column" height={labels.length+(meta?1:0)+1} flexShrink={0}>{labels.map((s,i)=><Row key={i} width={inner} theme={theme} selected={item.id===selected?.id} bold={item.id===selected?.id} tone={item.id===selected?.id?'accent':'foreground'}>{`${i===0?(item.id===selected?.id?(active&&focus===0?'>':'*'):' '):' '} ${s}`}</Row>)}{meta&&<Row width={inner} theme={theme} tone="muted">{'  '+meta}</Row>}</Box>)}
   <Box flexGrow={1}/><Row width={inner} theme={theme} tone="muted">{items.length?`${at+1} / ${items.length} · ${selected?.directory?'Enter expand':'Enter inspect'}`:query?'Ctrl+U clears filter':'Review coverage and stage availability'}</Row>
  </Panel>;
 })}
 </Box></Box>;
}
