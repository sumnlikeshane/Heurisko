// Revision-7 shell composition, with actual report identity and responsive section labels.
import React from 'react';
import {Box,Text} from 'ink';
import type {ReportReader} from '../../../../integration/part4/dist/report-reader.js';
import {NavigationTabs} from './NavigationTabs.js';
import {Row,Divider} from './Panel.js';
import {color,type Theme} from '../tokens.js';
import {fit} from '../terminal/safe-text.js';
import stringWidth from 'string-width';
const sectionNames=['Overview','Findings','Files','Source','AI','Coverage'];
export function shellBodyHeight(rows:number,columns:number,report:boolean){return Math.max(1,rows-(report?9:6)-(columns<80?1:0));}
export function fitShortcuts(hints:string[],width:number,allowQuit=true){const selected:string[]=[];for(const hint of hints)if(stringWidth([...selected,hint,...(allowQuit?['q quit']:[])].join('  '))<=width)selected.push(hint);return [...selected,...(allowQuit?['q quit']:[])].join('  ');}
export function Shell({columns,rows,theme,route,reader,section,navFocus,navSelected,sectionFocus,context,hints,notice,allowQuit=true,children}:{columns:number;rows:number;theme:Theme;route:string;reader?:ReportReader;section:number;navFocus:boolean;navSelected:number;sectionFocus:boolean;context:string;hints:string[];notice:string;allowQuit?:boolean;children:React.ReactNode}){
 const w=columns-4,report=reader&&route==='report'||reader&&route==='evidence',active=route==='monitor'?2:report||route==='recent'?1:0;
 return <Box width={columns} height={rows-1} flexDirection="column" backgroundColor={color(theme,'background')} paddingX={2}>
 {columns>=80?<Box height={1} flexShrink={0} gap={2}><Text bold color={color(theme,'foreground')}>HEURISKO</Text><NavigationTabs active={active} selected={navSelected} focused={navFocus} theme={theme}/><Box flexGrow={1}/>{reader?.report.fixtureKind==='synthetic_contract'&&report&&<Text color={color(theme,'warning')}>SYNTHETIC</Text>}</Box>:<><Box height={1} flexShrink={0}><Text bold color={color(theme,'foreground')}>HEURISKO</Text><Box flexGrow={1}/>{report&&reader?.report.fixtureKind==='synthetic_contract'&&<Text color={color(theme,'warning')}>SYNTHETIC</Text>}</Box><NavigationTabs active={active} selected={navSelected} focused={navFocus} theme={theme}/></>}
 <Divider width={w} theme={theme}/>
 {report&&reader&&<><Row width={w} theme={theme} bold>{`${reader.report.bundle.artifact.packageName??reader.report.bundle.artifact.artifactFilename}${reader.report.bundle.artifact.version?'@'+reader.report.bundle.artifact.version:''} / ${reader.report.bundle.artifact.origin==='local'?'LOCAL INPUT / ':''}HISTORICAL / ${reader.report.outcomes.analysisCompleteness} / Captured ${reader.report.bundle.artifact.captureTime}`}</Row><Box height={1} flexShrink={0}>{sectionNames.map((s,i)=><Text key={s}><Text bold={i===section} underline={i===section} color={color(theme,sectionFocus&&i===section?'background':i===section?'accent':'foreground')} backgroundColor={sectionFocus&&i===section?color(theme,'accent'):undefined}>{fit(`${i+1} ${columns<80?['Ov','Find','Files','Src','AI','Scope'][i]:s}`,columns<80?[6,8,9,7,6,8][i]!:[13,13,10,11,7,12][i]!,theme.ascii)}</Text></Text>)}</Box><Row width={w} theme={theme} tone="muted">{route==='evidence'?'Raw retained evidence · Esc returns to its origin':'Historical — online checks have not refreshed · i Identity'}</Row></>}
 <Box height={shellBodyHeight(rows,columns,!!report)} flexShrink={0} flexDirection="column">{children}</Box>
 <Row width={w} theme={theme} tone={notice?'warning':'muted'}>{notice||context}</Row>
 <Box height={1} flexShrink={0}><Text>{fitShortcuts(hints,w,allowQuit).split('  ').map((s,i)=>{const n=s.indexOf(' ');return <Text key={i}><Text bold color={color(theme,'accent')}>{n<0?s:s.slice(0,n)}</Text><Text color={color(theme,'foreground')}>{n<0?'':s.slice(n)}{'  '}</Text></Text>;})}</Text></Box>
 </Box>;
}
