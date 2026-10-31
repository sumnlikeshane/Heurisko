// Bounded display alignment adapted from revision-7 diffLines. It never changes report facts.
import type {EvidenceRead} from '../../../integration/part4/dist/report-reader.js';
import type {Line} from './components/DocumentPane.js';
import {safeText,fit} from './terminal/safe-text.js';
import {graphemes} from './state/text-entry.js';
export const diffViewLimits=Object.freeze({rowsPerSide:200,bytesPerRead:4096});
export function rawDiffLines(source:EvidenceRead,artifact:EvidenceRead,width:number,sideBySide:boolean,pan:number):Line[]{
 const content=(r:EvidenceRead)=>r.kind==='content'&&r.encoding==='utf8'?(r.inertText??'').split('\n'):undefined;
 const a=content(source),b=content(artifact),text=(s:string)=>graphemes(safeText(s)).slice(pan).join('');
 const description=(r:EvidenceRead)=>r.kind==='content'?`raw ${r.encoding} bytes [${r.displayedRange.startByte},${r.displayedRange.endByte}) / truncated ${r.truncated}`:'Metadata only: '+r.reason;
 const out:Line[]=[{text:'RAW CHANGED SPANS / '+(sideBySide?'side-by-side':'unified'),tone:'accent',bold:true},{text:'SOURCE: '+description(source),tone:'muted'},{text:'ARTIFACT: '+description(artifact),tone:'muted'},{text:'Viewer line alignment v1 / window-relative row numbers / e opens exact bytes',tone:'muted'}];
 if(!a||!b){
  for(const [label,read,lines]of [['SOURCE',source,a],['ARTIFACT',artifact,b]] as const){out.push({text:label,bold:true},{text:description(read),tone:read.kind==='metadata_only'?'warning':'muted'});if(lines)out.push(...lines.slice(0,200).map(text=>({text})));else if(read.kind==='content')out.push({text:'BASE64 '+read.bytesBase64});}
  out.push({text:'No aligned comparison is inferred where a side is absent, missing or binary.',tone:'warning'});return out;
 }
 const left=a.slice(0,200),right=b.slice(0,200);const matrix=Array.from({length:left.length+1},()=>new Uint16Array(right.length+1));
 for(let i=left.length-1;i>=0;i--)for(let j=right.length-1;j>=0;j--)matrix[i]![j]=left[i]===right[j]?1+matrix[i+1]![j+1]!:Math.max(matrix[i+1]![j]!,matrix[i]![j+1]!);
 const aligned:Array<{a?:number;b?:number}>=[];let i=0,j=0;
 while(i<left.length||j<right.length){if(i<left.length&&j<right.length&&left[i]===right[j])aligned.push({a:i++,b:j++});else if(j<right.length&&(i===left.length||matrix[i]![j+1]!>matrix[i+1]![j]!))aligned.push({b:j++});else aligned.push({a:i++});}
 if(sideBySide){const half=Math.max(1,Math.floor((width-3)/2));out.push({text:fit('SOURCE (-)',half)+' | ARTIFACT (+)',raw:true,tone:'muted'});
  for(let n=0;n<aligned.length;n++){let row=aligned[n]!;const next=aligned[n+1];if(row.a!==undefined&&row.b===undefined&&next?.a===undefined&&next?.b!==undefined){row={a:row.a,b:next.b};n++;}
   const equal=row.a!==undefined&&row.b!==undefined&&left[row.a]===right[row.b],l=row.a===undefined?'':`S${row.a+1} ${equal?' ':'-'} ${text(left[row.a]!)}`,r=row.b===undefined?'':`A${row.b+1} ${equal?' ':'+'} ${text(right[row.b]!)}`;
   out.push({text:fit(l,half)+' | '+fit(r,half),left:fit(l,half),right:fit(r,half),leftTone:equal?'muted':'error',rightTone:equal?'muted':'positive',raw:true});
  }
 }else{out.push({text:'SOURCE (-) → ARTIFACT (+) / relative window rows',tone:'muted'});for(const row of aligned){const equal=row.a!==undefined&&row.b!==undefined;if(row.a!==undefined)out.push({text:`${equal?' ':'-'} S${row.a+1} ${text(left[row.a]!)}`,tone:equal?'muted':'error',raw:true});if(row.b!==undefined&&!equal)out.push({text:`+ A${row.b+1} ${text(right[row.b]!)}`,tone:'positive',raw:true});}}
 if(a.length>200||b.length>200)out.push({text:`Display bounded to 200 rows per side; remaining window rows: source ${Math.max(0,a.length-200)}, artifact ${Math.max(0,b.length-200)}. e opens raw paging.`,tone:'warning'});
 return out;
}
