import React from 'react';
import {render} from 'ink';
import {App} from './App.js';
import type {ReportReader} from '../../../integration/part4/dist/report-reader.js';
export async function launchTui(options:{storeRoot:string;reader?:ReportReader;ascii?:boolean;noColor?:boolean;palette?:boolean}) {
 if(!process.stdin.isTTY||!process.stdout.isTTY)throw Error('TUI_REQUIRES_TTY');
 let restored=false;
 const restore=()=>{if(!restored){restored=true;process.stdout.write('\x1b[0m\x1b[?25h\x1b[?1049l');}};
 process.stdout.write('\x1b[?1049h\x1b[?25l');process.once('exit',restore);
 const app=render(<App {...options} theme={{ascii:!!options.ascii,noColor:!!options.noColor||process.env.NO_COLOR!==undefined,palette:!!options.palette}}/>,{exitOnCtrlC:false,patchConsole:false,maxFps:20});
 // OS signals follow the same cancellation path as keyboard input.
 const stop=()=>process.emit('heurisko-interrupt' as NodeJS.Signals);
 process.on('SIGTERM',stop);process.on('SIGINT',stop);
 try{await app.waitUntilExit();}finally{app.unmount();restore();process.removeListener('exit',restore);process.removeListener('SIGTERM',stop);process.removeListener('SIGINT',stop);}
}
