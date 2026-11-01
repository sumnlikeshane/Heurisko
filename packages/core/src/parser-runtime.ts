import { homedir } from 'node:os';
import type { ParserLimits } from './archive.js';
import { safetyProfile } from './safety.js';

// Only the local Unix socket is used; ambient remote Docker contexts/hosts do
// not select where public inputs or private job mounts are sent.
export function localDockerArgs(args:string[]):string[] {
  if(!['darwin','linux'].includes(process.platform))throw new Error('PARSER_PLATFORM_UNSUPPORTED');
  const socket=process.platform==='darwin'?`${homedir()}/.docker/run/docker.sock`:'/var/run/docker.sock';
  return ['--host',`unix://${socket}`,...args];
}
export function parserContainerArguments(paths:{worker:string;input:string;output:string},limits:ParserLimits,name:string,label:string):string[] {
  if(Object.values(paths).some(p=>/[,\r\n\x00]/.test(p)))throw new Error('PARSER_MOUNT_PATH_REJECTED');
  if(!/^heurisko-parser-[a-f0-9-]+$/.test(name)||!/^[a-f0-9]{64}$/.test(label))throw new Error('PARSER_JOB_ID_REJECTED');
  return ['create','--pull=never','--name',name,'--label',`heurisko.store=${label}`,'--network=none','--read-only','--memory',String(limits.memoryBytes),'--memory-swap',String(limits.memoryBytes),'--cpus=1','--pids-limit=16','--cap-drop=ALL','--security-opt=no-new-privileges','--user=65534:65534','--mount',`type=bind,src=${paths.worker},dst=/worker.py,readonly`,'--mount',`type=bind,src=${paths.input},dst=/input.tar,readonly`,'--mount',`type=bind,src=${paths.output},dst=/out`,safetyProfile.parser.image,'python','-I','/worker.py','/input.tar','/out',JSON.stringify(limits)];
}
