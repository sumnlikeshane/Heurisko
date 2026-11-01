import React from 'react';
import {Box,Text} from 'ink';
import {color,type Theme} from '../tokens.js';
import {fit} from '../terminal/safe-text.js';
export function NavigationTabs({active,selected,focused,theme}:{active:number;selected:number;focused:boolean;theme:Theme}) {
  const tabs=[['H','Home',10],['I','Investigations',21],['M','Monitoring',17]] as const;
  return <Box height={1} flexShrink={0}>{tabs.map(([key,label,width],i)=>{
    const hasFocus=focused&&selected===i,isActive=active===i;
    return <Text key={label}>
      <Text color={color(theme,hasFocus?'accent':'muted')}>{hasFocus?'>':' '}</Text>
      <Text bold={isActive||hasFocus} underline={isActive} backgroundColor={hasFocus?color(theme,'accent'):undefined} color={color(theme,hasFocus?'background':isActive?'accent':'muted')}>{fit(`${key} ${label}`,width-1,theme.ascii)}</Text>
    </Text>;
  })}</Box>;
}
