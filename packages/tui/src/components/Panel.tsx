import React from 'react';
import {Box,Text,type BoxProps} from 'ink';
import stringWidth from 'string-width';
import {color,type Theme,type Tone} from '../tokens.js';
import {fit} from '../terminal/safe-text.js';
export function Row({children,width,tone='foreground',bold=false,selected=false,theme}:{children:string;width:number;tone?:Tone;bold?:boolean;selected?:boolean;theme:Theme}) {
  return <Box height={1} flexShrink={0} width={Math.max(0,width)}><Text color={color(theme,tone)} bold={bold} backgroundColor={selected?color(theme,'selection'):undefined}>{fit(children,width,theme.ascii)}</Text></Box>;
}
export function Divider({width,label='',theme}:{width:number;label?:string;theme:Theme}) {
  const line=theme.ascii?'-':'─',text=label?` ${label} `:'';
  return <Text color={color(theme,'border')}>{line}{label&&<Text color={color(theme,'muted')}>{text}</Text>}{line.repeat(Math.max(0,width-1-stringWidth(text)))}</Text>;
}
export function Panel({title,meta='',focused=false,width,height,children,theme,inset=1,paddingY=0}:{title:string;meta?:string;focused?:boolean;width:number;height?:number;children:React.ReactNode;theme:Theme;inset?:number;paddingY?:number}) {
  const border:BoxProps['borderStyle']=theme.ascii?{topLeft:'+',top:'-',topRight:'+',left:'|',bottomLeft:'+',bottom:'-',bottomRight:'+',right:'|'}:'single';
  const horizontal=theme.ascii?'-':'─',tl=theme.ascii?'+':'┌',tr=theme.ascii?'+':'┐',bl=theme.ascii?'+':'└',br=theme.ascii?'+':'┘';
  const metadata=meta?` ${meta} `:'',label=` ${focused?'> ':''}${title} `;
  const labelWidth=Math.min(stringWidth(label),Math.max(1,width-4-stringWidth(metadata)));
  const rest=Math.max(0,width-3-labelWidth-stringWidth(metadata));
  return <Box width={width} height={height} flexDirection="column" flexShrink={0}>
    <Box height={1} flexShrink={0}>
      <Text color={color(theme,focused?'focus':'border')}>{tl}{horizontal}</Text>
      <Text bold color={color(theme,'foreground')}>{focused?<>{' '}<Text color={color(theme,'accent')}>{'>'}</Text>{fit(label,labelWidth,theme.ascii).slice(2)}</>:fit(label,labelWidth,theme.ascii)}</Text>
      <Text color={color(theme,focused?'focus':'border')}>{horizontal.repeat(rest)}</Text>
      <Text color={color(theme,'muted')}>{metadata}</Text>
      <Text color={color(theme,focused?'focus':'border')}>{tr}</Text>
    </Box>
    <Box width={width} height={height===undefined?undefined:Math.max(0,height-2)} borderStyle={border} borderTop={false} borderBottom={false} borderColor={color(theme,focused?'focus':'border')} paddingX={inset} paddingY={paddingY} flexDirection="column" flexShrink={0} overflow="hidden">{children}</Box>
    <Text color={color(theme,focused?'focus':'border')}>{bl}{horizontal.repeat(Math.max(0,width-2))}{br}</Text>
  </Box>;
}
export function StatusRow({label,status,detail='',tone='muted',width,theme,selected=false,separator=false}:{label:string;status:string;detail?:string;tone?:Tone;width:number;theme:Theme;selected?:boolean;separator?:boolean}) {
  const separatorWidth=separator?3:0;
  const labelWidth=Math.min(separator?21:24,Math.max(12,Math.floor(width*.58))),available=Math.max(0,width-labelWidth-separatorWidth);
  const visibleStatus=fit(status,Math.min(stringWidth(status),available),theme.ascii);
  return <Box width={width} height={1} flexShrink={0} backgroundColor={selected?color(theme,'selection'):undefined}>
    <Text color={color(theme,'muted')}>{fit(label,labelWidth,theme.ascii)}</Text>
    {separator&&<Text color={color(theme,'border')}>{theme.ascii?' | ':' │ '}</Text>}
    <Text color={color(theme,tone)}>{visibleStatus}</Text>
    <Text color={color(theme,'muted')}>{fit(detail?` ${detail}`:'',Math.max(0,available-stringWidth(visibleStatus)),theme.ascii)}</Text>
  </Box>;
}
