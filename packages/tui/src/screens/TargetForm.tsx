// Revision-7 TargetPicker geometry, buttons and cursor fields adapted to real npm/local inputs.
import React from 'react';
import {Box,Text} from 'ink';
import stringWidth from 'string-width';
import {Panel,Row,Divider} from '../components/Panel.js';
import {color,type Theme} from '../tokens.js';
import {fit} from '../terminal/safe-text.js';
import {graphemes} from '../state/text-entry.js';
export const fieldLabels=['Package name','Exact version','Archive path','Source repository','Full commit','Subdirectory','Source archive (optional)'];
const placeholders=['@scope/package','1.2.3','./package-1.2.3.tgz','https://github.com/owner/repository','40-character immutable commit','Repository root if empty','Optional retained source .tar.gz'];
export function ActionButton({label,focused,width,theme,enabled=true}:{label:string;focused:boolean;width:number;theme:Theme;enabled?:boolean}){
 return <Box height={1} flexShrink={0}><Text bold={enabled} color={color(theme,!enabled?'muted':focused?'background':'accent')} backgroundColor={enabled?color(theme,focused?'accent':'selection'):undefined}>{fit(` ${enabled&&focused?'> ':''}${label}${enabled?'':' (unavailable)'}`,width,theme.ascii)}</Text></Box>;
}
function TargetField({label,value,placeholder,focused,cursor,width,theme}:{label:string;value:string;placeholder:string;focused:boolean;cursor:number;width:number;theme:Theme}){
 const chars=graphemes(value),position=Math.min(chars.length,cursor),space=Math.max(1,width-4);let start=position;
 while(start>0&&stringWidth(chars.slice(start-1,position).join(''))<space-1)start--;
 const before=chars.slice(start,position).join(''),at=chars[position]??' ',after=chars.slice(position+1).join('');
 return <><Row width={width} theme={theme} tone={focused?'accent':'muted'} bold={focused}>{`${label}${focused?'  [editing]':''}`}</Row><Box width={width} height={1} flexShrink={0} backgroundColor={color(theme,focused?'selection':'surface')}><Text color={color(theme,focused?'accent':'muted')}>{focused?'> ':'  '}</Text>{focused?<><Text color={color(theme,'foreground')}>{before}</Text><Text color={color(theme,'background')} backgroundColor={color(theme,'accent')}>{at}</Text><Text color={color(theme,value?'foreground':'muted')}>{fit(value?after:placeholder,Math.max(0,width-2-stringWidth(before+at)),theme.ascii)}</Text></>:<Text color={color(theme,value?'foreground':'muted')}>{fit(value||placeholder,width-2,theme.ascii)}</Text>}</Box></>;
}
export function TargetForm({columns,height,theme,local,field,values,cursor,error,example}:{columns:number;height:number;theme:Theme;local:boolean;field:number;values:string[];cursor:number;error?:string;example:number}){
 const width=Math.min(columns-4,86),inner=width-4,fields=local?[2,3,4,5,6]:[0,1,3,4,5],capacity=Math.max(1,Math.floor((height-8)/2)),at=fields.indexOf(field),start=Math.max(0,at-capacity+1),shown=fields.slice(start,start+capacity),h=Math.min(height,shown.length*2+8);
 return <Box width={columns-4} height={height} justifyContent="center" alignItems="flex-start" paddingTop={height>h?1:0}><Panel title="New investigation" meta="1 / 2" width={width} height={h} focused theme={theme}>
 <Box height={1} flexShrink={0}><Text color={color(theme,field===-1?'accent':'muted')}>{field===-1?'> Input (Ctrl+T)  ':'  Input (Ctrl+T)  '}</Text><Text bold color={color(theme,!local?'accent':'muted')}>{!local?'[ npm ]':'npm'}</Text><Text color={color(theme,'muted')}>{'   '}</Text><Text bold color={color(theme,local?'accent':'muted')}>{local?'[ Local archive ]':'Local archive'}</Text></Box>
 <Box height={1}/>
 {shown.map(i=><TargetField key={i} label={fieldLabels[i]!+(i===3&&!local?' (optional override)':'')} value={values[i]!} placeholder={placeholders[i]!} focused={field===i} cursor={cursor} width={inner} theme={theme}/>)}
 <Row width={inner} theme={theme} tone={error?'error':'muted'}>{error||'AI disabled / runtime unavailable · source selection is not provenance'}</Row>
 <ActionButton label={`Load retained example${field===8?' / '+['local mutation','local baseline','npm target'][example]:''}`} focused={field===8} width={inner} theme={theme}/>
 <ActionButton label="Review target" focused={field===7} width={inner} theme={theme}/>
 </Panel></Box>;
}
export function TargetReview({columns,height,theme,lines,scroll}:{columns:number;height:number;theme:Theme;lines:string[];scroll:number}){
 const width=Math.min(columns-4,92),inner=width-4,h=Math.min(height,Math.max(9,lines.length+4));
 // Every full identity remains scrollable; Start is a separate explicit action.
 return <Box width={columns-4} height={height} justifyContent="center" alignItems="flex-start" paddingTop={height>h?1:0}><Panel title="Review exact target" meta="2 / 2" width={width} height={h} focused theme={theme}>
 <ReviewRows lines={lines} width={inner} capacity={h-4} scroll={scroll} theme={theme}/>
 <ActionButton label="Start investigation" focused width={inner} theme={theme}/>
 </Panel></Box>;
}
import {wrap} from '../terminal/safe-text.js';
function ReviewRows({lines,width,capacity,scroll,theme}:{lines:string[];width:number;capacity:number;scroll:number;theme:Theme}){
 const all=lines.flatMap(l=>wrap(l,width)),offset=Math.max(0,Math.min(scroll,Math.max(0,all.length-capacity)));
 return <><Box height={capacity} flexShrink={0} flexDirection="column">{all.slice(offset,offset+capacity).map((l,i)=><Row key={i} width={width} theme={theme} tone={l.startsWith('!')?'warning':'foreground'} bold={offset+i===0}>{l}</Row>)}</Box><Row width={width} theme={theme} tone="muted">{`${offset+1}-${Math.min(offset+capacity,all.length)} / ${all.length} · Enter Start · Esc edit`}</Row></>;
}
