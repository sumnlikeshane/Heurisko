import {useCallback,useEffect,useRef} from 'react';
import {useInput,useStdin,type Key} from 'ink';
export type TerminalKey=Key&{home:boolean;end:boolean};
/** Ink 6.3.1 maps both DEL/backspace and forward-delete to key.delete, and omits
 * Home/End flags. Retain its exact input event before useInput parses it. This
 * small version-pinned adapter never reads stdin independently or consumes input. */
export function useTerminalInput(handler:(input:string,key:TerminalKey)=>void) {
  const {internal_eventEmitter:events}=useStdin(),raw=useRef(''),latest=useRef(handler);
  latest.current=handler;
  useEffect(()=>{
    const remember=(sequence:string)=>{raw.current=sequence;};
    events.prependListener('input',remember);return()=>{events.off('input',remember);};
  },[events]);
  useInput(useCallback((input,key)=>{
    const backspace=raw.current==='\x7f'||raw.current==='\x1b\x7f';
    latest.current(input,{...key,backspace:key.backspace||backspace,delete:key.delete&&!backspace,
      home:['\x1b[H','\x1bOH','\x1b[1~','\x1b[7~'].includes(raw.current),
      end:['\x1b[F','\x1bOF','\x1b[4~','\x1b[8~'].includes(raw.current)});
  },[]));
}
