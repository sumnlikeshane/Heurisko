#!/usr/bin/env node
import { resolve } from 'node:path';
import {ReportReader} from '../../../integration/part4/dist/report-reader.js';
import type { InvestigationReport, ArtifactInput } from '@heurisko/contracts';
import { EvidenceStore, boundedFile, canonicalJSON, decodeReportBytes, encodeReport, exitCode, investigate, terminalText, writeImmutable, npmCoordinates } from '@heurisko/core';

const help=`Heurisko local evidence 0.1.0
Usage:
  heurisko                         Open TUI when stdin/stdout are terminals
  heurisko tui REPORT [--store DIR] [--no-color] [--ascii] [--palette]
  heurisko analyze npm:NAME@EXACT_VERSION [options]
  heurisko analyze --artifact FILE --source https://github.com/OWNER/REPO --commit FULL_SHA [options]
  heurisko inspect REPORT_FILE_OR_SHA256 [--evidence ev_ID] [--store DIR] [--json]
Options:
  --subdirectory PATH     Explicit package subtree within the pinned source
  --source-archive FILE   Replay local source snapshot (commit remains user asserted)
  --name NAME --version V Record explicit local subject labels
  --store DIR            Evidence store (default .heurisko)
  --report FILE          Save immutable validated report JSON
  --bundle FILE          Save real importable EvidenceBundle JSON
  --policy REF           Requested policy; indeterminate until evaluator exists
  --json                 One JSON result on stdout; progress on stderr
  --no-ai --no-color     Disable AI / use inert uncolored output
Exact public npm releases and local tar/tar.gz use the same static producer.
Provenance is not checked: no admitted verifier. No target code is executed.
No model, monitor or TUI export yet. Saved reports remain historical.
Exit: 0 completed checks; 1 configured violation; 2 incomplete; 3 no usable report.
`;
function summary(r:InvestigationReport):string {
  const counts=new Map<string,number>();for(const c of r.bundle.changes)counts.set(c.status,(counts.get(c.status)??0)+1);
  return terminalText(`${r.reportId}\nArtifact: ${r.bundle.artifact.artifactFilename} ${r.bundle.artifact.observedSha256}\nCaptured: ${r.bundle.artifact.captureTime} (retained observation; no fresh registry/revocation check)\nSource: ${r.outcomes.sourceAssociation}; provenance: ${r.outcomes.provenancePolicy}\nCorrespondence: ${r.outcomes.correspondence}; analysis: ${r.outcomes.analysisCompleteness}; policy: ${r.outcomes.policyResult}\nFiles: ${[...counts].map(([k,v])=>`${k}=${v}`).join(', ')}; raw coverage ${r.bundle.coverage.complete?'complete':'incomplete'}\nAI: ${r.analysis.aiState.status}; findings: ${r.analysis.findings.length}\n${[...r.bundle.limitations,...r.analysis.limitations].join('\n')}\n`);
}
const valueFlags=new Set(['artifact','source','commit','subdirectory','source-archive','name','version','store','report','bundle','policy','evidence']);
const booleanFlags=new Set(['json','no-ai','no-color','ascii','palette']);
async function main():Promise<void> {
  const args=process.argv.slice(2);if(!args.length){if(process.stdin.isTTY&&process.stdout.isTTY){await (await import('@heurisko/tui')).launchTui({storeRoot:resolve('.heurisko')});}else process.stdout.write(help);return;}if(args.length===1&&args[0]==='--help'){process.stdout.write(help);return;}
  if(args[0]?.startsWith('--')){let root=resolve('.heurisko'),ascii=false,noColor=false,palette=false;const seen=new Set<string>();while(args.length){const flag=args.shift()!;if(seen.has(flag))throw Error('DUPLICATE_OPTION');seen.add(flag);if(flag==='--store'){const value=args.shift();if(!value||value.startsWith('--'))throw Error('OPTION_VALUE_REQUIRED');root=resolve(value);}else if(flag==='--ascii')ascii=true;else if(flag==='--no-color')noColor=true;else if(flag==='--palette')palette=true;else throw Error('UNKNOWN_OPTION');}if(process.stdin.isTTY&&process.stdout.isTTY)await(await import('@heurisko/tui')).launchTui({storeRoot:root,ascii,noColor,palette});else process.stdout.write(help);return;}
  const command=args.shift();if(command!=='analyze'&&command!=='inspect'&&command!=='tui')throw new Error('INVOCATION_INVALID');
  const flags=new Map<string,string|true>();const positional:string[]=[];
  while(args.length){const arg=args.shift()!;if(!arg.startsWith('--')){positional.push(arg);continue;}const name=arg.slice(2);if(flags.has(name))throw new Error('DUPLICATE_OPTION');if(booleanFlags.has(name))flags.set(name,true);else if(valueFlags.has(name)){const value=args.shift();if(!value||value.startsWith('--'))throw new Error('OPTION_VALUE_REQUIRED');flags.set(name,value);}else throw new Error('UNKNOWN_OPTION');}
  const get=(name:string)=>flags.get(name) as string|undefined;
  const permitted=command==='analyze'?new Set([...valueFlags].filter(x=>x!=='evidence')):command==='tui'?new Set(['store']):new Set(['store','evidence']);
  if(command!=='tui'&&(flags.has('ascii')||flags.has('palette')))throw Error('OPTION_NOT_APPLICABLE');
  if(command==='tui'&&(flags.has('json')||flags.has('no-ai')))throw Error('OPTION_NOT_APPLICABLE');
  for(const name of flags.keys())if(!booleanFlags.has(name)&&!permitted.has(name))throw new Error('OPTION_NOT_APPLICABLE');
  const store=new EvidenceStore(get('store')?resolve(get('store')!):undefined);
  if(command==='tui'){if(positional.length!==1)throw Error('INVOCATION_INVALID');const target=positional[0]!;const reader=target.startsWith('sha256:')?await ReportReader.openBytes(await store.get(target,8*1024*1024),store.root):await ReportReader.openFile(resolve(target),store.root);
    if(!process.stdin.isTTY||!process.stdout.isTTY){process.stdout.write(summary(structuredClone(reader.report) as InvestigationReport));process.exitCode=exitCode(reader.report);return;}
    process.exitCode=exitCode(reader.report);await(await import('@heurisko/tui')).launchTui({storeRoot:store.root,reader,noColor:flags.has('no-color'),ascii:flags.has('ascii'),palette:flags.has('palette')});return;}
  const controller=new AbortController();
  const cancel=()=>controller.abort();process.once('SIGINT',cancel);process.once('SIGTERM',cancel);
  try {
    let report:InvestigationReport;
    if(command==='analyze') {
      const spec=positional.length===1?positional[0]:undefined;
      const match=spec?/^npm:(.+)@([^@]+)$/.exec(spec):undefined;
      if((positional.length&& !match)||(!match&&!get('artifact'))||(match&&(get('artifact')||get('name')||get('version')||get('source-archive')))|| (!!get('source')!==!!get('commit'))||(!get('source')&&(get('source-archive')||get('subdirectory'))))throw new Error('INVOCATION_INVALID');
      if(match)npmCoordinates(match[1]!,match[2]!);
      const options={enableAI:!flags.has('no-ai'),analysisProfile:'raw-static-s3-v1',...(get('policy')?{trustPolicyRef:get('policy')}:{} )};
      const source=get('source')?{sourceOverride:{repo:get('source')!,commit:get('commit')!,...(get('subdirectory')?{subdirectory:get('subdirectory')}:{} )}}:{};
      const input:ArtifactInput=match?{ecosystem:'npm',packageName:match[1]!,version:match[2]!,analysisOptions:options,...source}:{ecosystem:'local',artifactPath:resolve(get('artifact')!),analysisOptions:options,...(get('name')?{packageName:get('name')}:{}),...(get('version')?{version:get('version')}:{}),...source};
      report=await investigate(input,options,{store,sourceArchivePath:get('source-archive')?resolve(get('source-archive')!):undefined,signal:controller.signal,onProgress:e=>process.stderr.write(`${e.stage}: ${e.status}\n`)});
      if(get('report'))await writeImmutable(resolve(get('report')!),Buffer.from(await encodeReport(report)));
      if(get('bundle'))await writeImmutable(resolve(get('bundle')!),Buffer.from(JSON.stringify(report.bundle)));
      process.stdout.write(flags.has('json')?canonicalJSON(report)+'\n':summary(report));process.exitCode=exitCode(report);
    } else {
      if(positional.length!==1)throw new Error('INVOCATION_INVALID');const target=positional[0]!;
      report=target.startsWith('sha256:')?await store.loadReport(target):await decodeReportBytes(await boundedFile(resolve(target),8*1024*1024));
      await store.verifyEvidence(report);
      if(get('evidence')) {
        const e=report.bundle.evidence.find(e=>e.evidenceId===get('evidence'));if(!e||e.contentState!=='retained'||!e.contentRef)throw new Error('EVIDENCE_NOT_RETAINED');
        const bytes=await store.get(e.contentRef);const excerpt=bytes.subarray(0,8192);
        process.stdout.write(flags.has('json')?canonicalJSON({reportId:report.reportId,evidence:e,content:{encoding:'base64',bytesBase64:excerpt.toString('base64'),totalBytes:bytes.length,truncated:bytes.length>excerpt.length},freshness:'retained observation; no fresh check'})+'\n':terminalText(`${e.evidenceId} ${e.contentRef}\n${excerpt.toString('utf8')}\n${bytes.length>excerpt.length?'[excerpt truncated; full bytes retained]\n':''}`));
      } else process.stdout.write(flags.has('json')?canonicalJSON(report)+'\n':summary(report));
      process.exitCode=exitCode(report);
    }
  } finally {process.removeListener('SIGINT',cancel);process.removeListener('SIGTERM',cancel);}
}
main().catch(error=>{
  const code=error instanceof Error&&/^[A-Z_]+$/.test(error.message)?error.message:'INVOCATION_OR_INTERNAL_ERROR';
  const cause=error instanceof Error&&error.cause&&typeof error.cause==='object'?error.cause as Record<string,unknown>:undefined;
  const ref=cause?.retainedFailureRef;
  process.stderr.write(`Heurisko: ${code}. Run --help for supported syntax.\n`);
  if(typeof ref==='string'&&/^sha256:[a-f0-9]{64}$/.test(ref))process.stderr.write(`Retained acquisition failure: ${ref}\n`);
  process.exitCode=3;
});
