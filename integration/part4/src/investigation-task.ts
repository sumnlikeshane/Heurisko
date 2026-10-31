// No keyboard, focus, renderer or persistent job lifecycle. Candidate adapter.
import type { ArtifactInput, AnalysisOptions, InvestigationReport } from '../../../packages/contracts/dist/index.js';
import { investigate, validateReport, exitCode, type InvestigationContext, type StageProgress } from '../../../packages/core/dist/index.js';
import { immutable, type Immutable } from './report-reader.js';

export const taskCapabilities=Object.freeze({cancellationRequest:true,cancellationAcknowledgment:false,partialReportFeed:false,detach:false,retry:false});
export type TaskResult =
  | {kind:'report';report:Immutable<InvestigationReport>;exitCode:0|1|2|3;cancellationRequested:boolean;cleanup:'not_observable'}
  | {kind:'error';code:string;exitCode:3;cancellationRequested:boolean;cleanup:'not_observable'};
export interface TaskSnapshot {
  phase:'running'|'cancel_requested'|'settled_report'|'settled_error';
  cancellationRequested:boolean;
  // sequence describes this subscriber's delivery order, not an engine job ID.
  events:ReadonlyArray<Readonly<StageProgress>&{sequence:number}>;
  omittedEvents:number;
}
export interface TaskOptions {
  context?:Omit<InvestigationContext,'signal'|'onProgress'>;
  // Explicit test injection only; never populated from artifact/report metadata.
  engine?:typeof investigate;
}
export function startInvestigation(input:ArtifactInput,options:AnalysisOptions,settings:TaskOptions={}) {
  const request=structuredClone(input),configuration=structuredClone(options);
  const context={...settings.context};const controller=new AbortController();
  const listeners=new Set<(snapshot:Immutable<TaskSnapshot>)=>void>();let sequence=0;
  let snapshot:Immutable<TaskSnapshot>=immutable({phase:'running',cancellationRequested:false,events:[],omittedEvents:0});
  function publish(next:TaskSnapshot) {
    snapshot=immutable(next);
    // A rendering/subscriber exception must not abort the core or lose a report.
    for(const listener of listeners) {try {listener(snapshot);} catch { /* observer failure is local */ }}
  }
  const onProgress=(event:Readonly<StageProgress>)=>{
    const events=[...snapshot.events,{...structuredClone(event),sequence:++sequence}];
    const overflow=Math.max(0,events.length-128);
    publish({...snapshot,events:events.slice(overflow),omittedEvents:snapshot.omittedEvents+overflow});
  };
  const result:Promise<TaskResult>=(async()=>{
    try {
      const output=await (settings.engine??investigate)(request,configuration,{...context,signal:controller.signal,onProgress});
      // Validate even injected engines; cancellation does not discard a returned
      // usable report while this trusted boundary check finishes.
      const report=immutable(await validateReport(output,{pythonExecutable:context.pythonExecutable}));
      publish({...snapshot,phase:'settled_report'});
      return Object.freeze({kind:'report',report,exitCode:exitCode(report),cancellationRequested:snapshot.cancellationRequested,cleanup:'not_observable'});
    } catch(error) {
      const code=error instanceof Error&&/^[A-Z_]+$/.test(error.message)?error.message:'INVESTIGATION_FAILED';
      publish({...snapshot,phase:'settled_error'});
      return Object.freeze({kind:'error',code,exitCode:3,cancellationRequested:snapshot.cancellationRequested,cleanup:'not_observable'});
    }
  })();
  return Object.freeze({result,capabilities:taskCapabilities,
    snapshot:()=>snapshot,
    subscribe(listener:(snapshot:Immutable<TaskSnapshot>)=>void) {
      listeners.add(listener);try {listener(snapshot);} catch { /* observer only */ }
      return ()=>{listeners.delete(listener);};
    },
    cancel() {
      if(snapshot.phase==='settled_report'||snapshot.phase==='settled_error'||snapshot.cancellationRequested) return false;
      publish({...snapshot,phase:'cancel_requested',cancellationRequested:true});controller.abort();return true;
    }});
}
