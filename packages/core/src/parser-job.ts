import { execFile, spawn } from 'node:child_process';
import { localDockerArgs } from './parser-runtime.js';
import { safetyProfile } from './safety.js';

export interface ParserJobDriver {
  create(args:string[]):Promise<string>;
  start(id:string,onStderr:(bytes:number)=>void):{done:Promise<number|null>;close:()=>void};
  kill(id:string):Promise<void>;
  remove(id:string):Promise<boolean>;
}
// This driver is trusted infrastructure, never selected by package metadata.
export const dockerParserDriver:ParserJobDriver={
  create:args=>command(args,safetyProfile.parser.createTimeoutMs),
  start(id,onStderr) {
    const child=spawn('docker',localDockerArgs(['start','--attach',id]),{stdio:['ignore','ignore','pipe'],env:environment(),windowsHide:true});
    child.stderr!.on('data',(bytes:Buffer)=>onStderr(bytes.length));
    const done=new Promise<number|null>(resolve=>{child.on('error',()=>resolve(null));child.on('close',resolve);});
    return {done,close:()=>{child.kill('SIGKILL');}};
  },
  async kill(id){await command(['kill',id]).catch(()=>{});},
  async remove(id) {
    try {await command(['rm','-f',id]);}
    catch(error) {if(!(error instanceof Error&&'stderr' in error&&String(error.stderr).includes(`No such container: ${id}`)))return false;}
    // Do not release spool/store locks from the attach client's exit or a
    // removal attempt alone. Confirm absence of the acknowledged immutable ID.
    return parserJobAbsent(id);
  },
};
// Docker versions differ in missing-inspect diagnostics. A successful complete
// query for the full acknowledged ID must return no objects; errors, names,
// partial IDs and any returned content never confirm absence.
export async function parserJobAbsent(id:string):Promise<boolean> {
  if(!/^[a-f0-9]{64}$/.test(id))return false;
  try {return await command(['container','ls','--all','--quiet','--no-trunc','--filter',`id=${id}`])==='';}
  catch {return false;}
}
function environment(){return {PATH:process.env.PATH,HOME:process.env.HOME,LANG:'C.UTF-8'};}
function command(args:string[],timeout:number=safetyProfile.parser.controlTimeoutMs):Promise<string> {
  return new Promise((accept,reject)=>execFile('docker',localDockerArgs(args),{env:environment(),timeout,maxBuffer:4096},(error,stdout,stderr)=>{
    if(error)reject(Object.assign(error,{stderr}));else accept(stdout.trim());
  }));
}
export async function runParserJob(args:string[],name:string,wallMs:number,signal?:AbortSignal,driver:ParserJobDriver=dockerParserDriver):Promise<{code:string;cleanupConfirmed:boolean}> {
  let code='PARSER_INTERRUPTED',stderrBytes=0;
  let stop!:()=>void;
  const stopped=new Promise<void>(resolve=>{stop=resolve;});
  const cancel=()=>{if(code==='PARSER_INTERRUPTED'){code='CANCELLED';stop();}};
  const timer=setTimeout(()=>{if(code==='PARSER_INTERRUPTED'){code='PARSER_TIMEOUT';stop();}},wallMs);
  signal?.addEventListener('abort',cancel,{once:true});
  try {
    if(signal?.aborted)cancel();
    if(code!=='PARSER_INTERRUPTED')return {code,cleanupConfirmed:true};
    let id:string;
    try {
      id=await driver.create(args);
      if(!/^[a-f0-9]{64}$/.test(id))throw new Error('UNACKNOWLEDGED_CREATE');
    } catch {
      // A timed-out client does not cancel the daemon's create request. Even
      // an immediate not-found response cannot exclude a later-created job.
      // Keep its durable job record, private spool and locks for exact recovery.
      await driver.remove(name).catch(()=>false);
      return {code:'PARSER_CREATE_UNCONFIRMED',cleanupConfirmed:false};
    }
    if(code==='PARSER_INTERRUPTED') {
      try {
        const attached=driver.start(id,n=>{stderrBytes+=n;if(stderrBytes>4096&&code==='PARSER_INTERRUPTED'){code='PARSER_OUTPUT_LIMIT';stop();}});
        const completion=attached.done.then(status=>({status}));
        const result=await Promise.race([completion,stopped.then(()=>({stopped:true}))]);
        if('stopped' in result) {
          await driver.kill(id).catch(()=>{});
          attached.close();
          // Removal below acknowledges that this exact daemon job stopped.
        } else if(code==='PARSER_INTERRUPTED'&&result.status!==0)code='PARSER_RUNTIME_OR_INPUT_FAILURE';
      }catch {if(code==='PARSER_INTERRUPTED')code='PARSER_UNAVAILABLE';}
    }
    const cleanupConfirmed=await driver.remove(id).catch(()=>false);
    return {code,cleanupConfirmed};
  } finally {clearTimeout(timer);signal?.removeEventListener('abort',cancel);}
}
