import React from 'react';
import {Box} from 'ink';
import {Panel,Row,Divider,StatusRow} from '../components/Panel.js';
import type {Theme,Tone} from '../tokens.js';
import type {OverviewReport as Scenario} from '../view-model.js';
import {wrap} from '../terminal/safe-text.js';
type Navigation={findingSelected:number;focus:number;overviewScroll:number};

export const emptyFindingCopy=(s:Scenario)=>!s.findingsEvaluated?'Findings not evaluated / analysis unavailable.':s.outcomes.analysisCompleteness==='failed'?'Findings unavailable - analysis failed.':s.outcomes.analysisCompleteness==='incomplete'?'No findings recorded; analysis is incomplete.':'No findings recorded within the examined scope.';
export function independentRows(s:Scenario):{label:string;status:string;detail:string;tone:Tone}[] {
  const o=s.outcomes;
  return [
    {label:'Artifact integrity',status:o.artifactIntegrity==='matched'?'Digest matched':o.artifactIntegrity==='mismatched'?'Digest mismatch':o.artifactIntegrity==='not_available'?'Unavailable':'Not checked',detail:'',tone:o.artifactIntegrity==='matched'?'positive':o.artifactIntegrity==='mismatched'?'error':'muted'},
    {label:'Source association',status:o.sourceAssociation==='ambiguous'?'Conflicting claims':o.sourceAssociation==='unavailable'?'Unavailable':o.sourceAssociation==='corroborated'?'Corroborated':o.sourceAssociation==='user_supplied'?'User selected':'Claim only',detail:'',tone:o.sourceAssociation==='ambiguous'?'warning':'muted'},
    {label:'Provenance',status:o.provenancePolicy==='not_checked'?'Not checked':o.provenancePolicy==='verified_cryptographic_only'?'Crypto only':o.provenancePolicy==='verified_policy'?'Policy verified':o.provenancePolicy==='absent'?'Absent':o.provenancePolicy==='invalid'?'Invalid':'Unresolved',detail:'',tone:o.provenancePolicy==='invalid'?'error':o.provenancePolicy==='verified_policy'?'positive':o.provenancePolicy==='unresolved'?'warning':'muted'},
    {label:'Correspondence',status:o.correspondence==='exact'?'Exact in scope':o.correspondence==='reproduced'?'Reproduced':o.correspondence==='partially_explained'?'Partly explained':o.correspondence==='not_assessed'?'Not assessed':'Unexplained',detail:'',tone:o.correspondence==='exact'||o.correspondence==='reproduced'?'positive':o.correspondence==='not_assessed'?'muted':'warning'},
    {label:'Analysis completeness',status:o.analysisCompleteness==='complete'?'Complete scope':o.analysisCompleteness==='failed'?'Failed':'Incomplete',detail:'',tone:o.analysisCompleteness==='complete'?'positive':o.analysisCompleteness==='failed'?'error':'warning'},
    {label:'Policy result',status:o.policyResult==='not_evaluated'?'Not evaluated':o.policyResult==='indeterminate'?'Indeterminate':o.policyResult==='violation'?'Violation':'Pass',detail:'',tone:o.policyResult==='violation'?'error':o.policyResult==='pass'?'positive':o.policyResult==='indeterminate'?'warning':'muted'},
  ];
}
function outcomeMeanings(s:Scenario):string[] {
  const o=s.outcomes;
  return [
    o.artifactIntegrity==='matched'?'Matches the recorded expected digest.':o.artifactIntegrity==='mismatched'?'Recorded expected digest does not match.':o.artifactIntegrity==='not_available'?'Digest evidence is unavailable.':'Digest comparison was not performed.',
    o.sourceAssociation==='ambiguous'?'Source claims identify different targets.':o.sourceAssociation==='unavailable'?'No corresponding source is recorded.':o.sourceAssociation==='corroborated'?'Candidate has corroborating evidence.':o.sourceAssociation==='user_supplied'?'Comparison target was chosen by user.':'Release-to-source link unproven.',
    o.provenancePolicy==='not_checked'?'No provenance verification was performed.':o.provenancePolicy==='absent'?'No provenance record was available.':o.provenancePolicy==='verified_cryptographic_only'?'Identity policy is not established.':o.provenancePolicy==='verified_policy'?'Recorded provenance policy was satisfied.':o.provenancePolicy==='invalid'?'Provenance verification did not succeed.':'Provenance remains unresolved.',
    o.correspondence==='exact'?'Compared bytes match in declared scope.':o.correspondence==='reproduced'?'Recorded build reproduction matched.':o.correspondence==='not_assessed'?'Correspondence was not assessed.':o.correspondence==='partially_explained'?'Unexplained content remains.':'Content differences remain unexplained.',
    o.analysisCompleteness==='complete'?'Complete only for declared scope.':o.analysisCompleteness==='failed'?'Analysis could not complete.':'Checks or files remain unfinished.',
    o.policyResult==='pass'?'Recorded policy requirements were satisfied.':o.policyResult==='violation'?'A configured policy requirement failed.':o.policyResult==='indeterminate'?'Policy requirements remain unresolved.':'No policy conclusion recorded.',
  ];
}
type Line={text:string;tone?:Tone;bold?:boolean};
const findingTitle=(id:string,title:string,marker:string,width:number)=>wrap(title,Math.max(1,width-2)).map((text,i)=>`${i===0?marker:'  '}${text}`);
export function overviewLines(s:Scenario,width:number,selectedIndex=0):Line[] {
  const outcomes=independentRows(s),selected=s.findings[Math.min(selectedIndex,Math.max(0,s.findings.length-1))];
  return [
    {text:'ESTABLISHED OBSERVATION',bold:true,tone:'accent'},...wrap(s.takeaway,width).map(text=>({text})),
    ...(s.outcomes.sourceAssociation==='ambiguous'?[{text:'! Source conflict: competing immutable candidates',tone:'warning' as const}]:[]),
    {text:' '},{text:'INDEPENDENT OUTCOMES',bold:true,tone:'accent'},
    ...outcomes.flatMap(row=>wrap(`${row.label.padEnd(23)} ${row.status}`,width).map(text=>({text,tone:row.tone}))),
    {text:' '},{text:'PRIORITY FINDINGS',bold:true,tone:'accent'},
    ...(s.findings.length?s.findings.flatMap((f,i)=>[...findingTitle(f.findingId,f.title,i===selectedIndex?'> ':'  ',width).map(text=>({text,bold:i===selectedIndex})),...wrap(`Priority ${f.reviewPriority} / Severity ${f.severity}`,width).map(text=>({text,tone:'muted' as const}))]):wrap(emptyFindingCopy(s),width).map(text=>({text,tone:s.outcomes.analysisCompleteness==='complete'?'muted' as const:'warning' as const}))),
    ...(selected?[{text:' '},...wrap(selected.observation,width).map(text=>({text})),{text:' '},{text:`Evidence confidence  ${selected.evidenceConfidence}`},{text:`Explanation          ${selected.explanationStrength.replaceAll('_',' ')}`,tone:['unexplained','hypothesis'].includes(selected.explanationStrength)?'warning' as const:'foreground' as const}]:[]),
    {text:' '},{text:'COVERAGE & UNKNOWNS',bold:true,tone:'accent'},
    {text:`Compared       ${s.comparedFiles} change records`},
    {text:`Source files   ${s.sourceFiles} recorded`},
    {text:`Artifact files ${s.artifactFiles} recorded`},
    ...(s.unknownRemainingScope?[{text:'Remaining files / bytes: Unknown',tone:'warning' as const}]:[]),
    {text:'Coverage gaps',bold:true},...s.omissions.flatMap(text=>wrap(`- ${text}`,width).map(text=>({text,tone:'muted' as const}))),
    {text:' '},{text:`AI: ${s.ai.status}`,tone:s.ai.status==='failed'?'error':'muted'},
    ...(s.ai.reason?wrap(s.ai.reason,width).map(text=>({text,tone:'muted' as const})):[]),
    {text:'NEXT ACTIONS',bold:true,tone:'accent'},...s.nextActions.flatMap((text,i)=>wrap(`${i+1}. ${text}`,width).map(text=>({text}))),
  ];
}

type Spacing={tier:'roomy'|'comfortable'|'tight'|'compact';inset:number;paddingY:number;paneGap:number;stackGap:number;heroGap:number;heroTextGap:number;sectionGap:number;findingGap:number;previewGap:number;descriptions:boolean;resultGap:number};
const spacingTiers:Spacing[]=[
  {tier:'roomy',inset:2,paddingY:1,paneGap:3,stackGap:2,heroGap:2,heroTextGap:1,sectionGap:1,findingGap:1,previewGap:2,descriptions:true,resultGap:1},
  {tier:'comfortable',inset:2,paddingY:1,paneGap:2,stackGap:1,heroGap:1,heroTextGap:1,sectionGap:0,findingGap:0,previewGap:1,descriptions:false,resultGap:0},
  {tier:'tight',inset:1,paddingY:0,paneGap:2,stackGap:1,heroGap:1,heroTextGap:1,sectionGap:0,findingGap:0,previewGap:1,descriptions:false,resultGap:0},
  {tier:'compact',inset:1,paddingY:0,paneGap:1,stackGap:1,heroGap:1,heroTextGap:0,sectionGap:0,findingGap:0,previewGap:1,descriptions:false,resultGap:0},
];
function spacedGeometry(columns:number,state:Pick<Navigation,'findingSelected'>,s:Scenario,spacing:Spacing) {
  const width=columns-4,left=Math.min(60,Math.floor((width-spacing.paneGap)*.49)),right=width-left-spacing.paneGap;
  const leftInner=Math.max(1,left-2-spacing.inset*2),rightInner=Math.max(1,right-2-spacing.inset*2),heroInner=Math.max(1,width-2-spacing.inset*2);
  const selectedIndex=Math.min(state.findingSelected,Math.max(0,s.findings.length-1)),selected=s.findings[selectedIndex];
  const firstFinding=Math.max(0,selectedIndex-1),shown=s.findings.slice(firstFinding,firstFinding+2);
  const titleRows=shown.map(f=>({finding:f,lines:findingTitle(f.findingId,f.title,f===selected?'> ':'  ',rightInner)}));
  const selectedTitle=selected?findingTitle(selected.findingId,selected.title,'  ',rightInner):[];
  const observation=selected?wrap(selected.observation,rightInner):[];
  // The full significance, limitations and citations live in Finding details.
  const significance:string[]=[];
  const panelPadding=spacing.paddingY*2;
  const multiple=s.findings.length>1;
  const listRows=multiple?titleRows.reduce((n,item)=>n+item.lines.length,0)+Math.max(0,shown.length-1)*spacing.findingGap+spacing.sectionGap+1:0;
  const findingContentRows=selected?listRows+(multiple?0:selectedTitle.length)+1+spacing.previewGap+observation.length+spacing.previewGap+3:wrap(emptyFindingCopy(s),rightInner).length+1;
  const meaningLines=outcomeMeanings(s).map(text=>wrap(text,leftInner));
  const outcomeContentRows=6+(spacing.descriptions?meaningLines.reduce((n,lines)=>n+lines.length,0):0)+5*spacing.resultGap;
  const findingHeight=Math.max(5+panelPadding,findingContentRows+2+panelPadding),outcomeHeight=outcomeContentRows+2+panelPadding;
  const omissionLines=s.omissions.flatMap(text=>wrap(text,Math.max(1,leftInner-2)).map((line,i)=>`${i?'  ':'- '}${line}`));
  let coverageHeight=Math.max(6+panelPadding,omissionLines.length+6+(s.unknownRemainingScope?1:0)+spacing.sectionGap+panelPadding);
  const actionLines=wrap(s.nextActions[0]??'No next action recorded.',rightInner);
  let nextHeight=Math.max(3+panelPadding,actionLines.length+2+panelPadding);
  let leftHeight=outcomeHeight+spacing.stackGap+coverageHeight,rightHeight=findingHeight+spacing.stackGap+nextHeight;
  // One spare row is enough to align a near-miss; do not inflate an empty pane.
  if(Math.abs(leftHeight-rightHeight)===1){if(leftHeight<rightHeight)coverageHeight++;else nextHeight++;}
  leftHeight=outcomeHeight+spacing.stackGap+coverageHeight;rightHeight=findingHeight+spacing.stackGap+nextHeight;
  const takeaway=wrap(s.takeaway,heroInner),heroHeight=takeaway.length+3+spacing.heroTextGap+panelPadding;
  const columnHeight=Math.max(leftHeight,rightHeight),needed=heroHeight+spacing.heroGap+columnHeight;
  return {...spacing,width,left,right,leftInner,rightInner,heroInner,selectedIndex,selected,titleRows,selectedTitle,multiple,meaningLines,observation,significance,findingHeight,outcomeHeight,omissionLines,coverageHeight,actionLines,nextHeight,takeaway,heroHeight,columnHeight,needed};
}
/** Most spacious fitting tier wins; compact two-column is tried before linear. */
export function overviewGeometry(columns:number,height:number,state:Pick<Navigation,'findingSelected'>,s:Scenario) {
  const candidates=spacingTiers.map(spacing=>spacedGeometry(columns,state,s,spacing));
  const fitting=columns>=100?candidates.find(g=>g.leftInner>=42&&g.rightInner>=40&&g.needed<=height):undefined;
  const chosen=fitting??candidates.at(-1)!;
  return {...chosen,linear:columns<100||!fitting};
}

export function Overview({columns,height,state,scenario:s,theme}:{columns:number;height:number;state:Navigation;scenario:Scenario;theme:Theme}) {
  const g=overviewGeometry(columns,height,state,s),w=g.width;
  if(g.linear) {
    const all=overviewLines(s,w-4,state.findingSelected),visible=Math.max(1,height-2),offset=Math.min(state.overviewScroll,Math.max(0,all.length-visible));
    const focused=state.focus>=0?['Outcomes','Findings','Coverage','Actions'][state.focus]:undefined;
    return <Panel width={w} height={height} title={focused?`Overview / ${focused}`:'Overview'} meta={`${offset+1}-${Math.min(all.length,offset+visible)}/${all.length}`} focused={state.focus>=0} theme={theme}>
      {all.slice(offset,offset+visible).map((line,i)=><Row key={i} width={w-4} theme={theme} {...line}>{line.text}</Row>)}
    </Panel>;
  }
  const outcomes=independentRows(s);
  return <>
    <Panel width={w} height={g.heroHeight} title="ESTABLISHED OBSERVATION" theme={theme} inset={g.inset} paddingY={g.paddingY}>
      {g.takeaway.map((text,i)=><Row key={i} width={g.heroInner} theme={theme} bold>{text}</Row>)}
      <Box height={g.heroTextGap}/>
      <Row width={g.heroInner} theme={theme} tone={s.outcomes.sourceAssociation==='ambiguous'?'warning':'muted'}>{s.outcomes.sourceAssociation==='ambiguous'?'! Source conflict / competing commits / release binding unresolved':s.source.length?`Source candidate  ${s.source[0]?.commit?.slice(0,12)??'commit not recorded'}  /  release binding not proven`:'No source candidate recorded.'}</Row>
    </Panel>
    <Box height={g.heroGap}/>
    <Box height={g.columnHeight} gap={g.paneGap}>
      <Box width={g.left} flexDirection="column">
        <Panel width={g.left} height={g.outcomeHeight} title="Independent outcomes" focused={state.focus===0} theme={theme} inset={g.inset} paddingY={g.paddingY}>
          {outcomes.map((row,i)=><React.Fragment key={row.label}>
            <StatusRow width={g.leftInner} theme={theme} separator {...row}/>
            {g.descriptions&&g.meaningLines[i]!.map((text,j)=><Row key={j} width={g.leftInner} theme={theme} tone="muted">{text}</Row>)}
            {i<outcomes.length-1&&<Box height={g.resultGap}/>}
          </React.Fragment>)}
        </Panel>
        <Box height={g.stackGap}/>
        <Panel width={g.left} height={g.coverageHeight} title="Coverage & unknowns" focused={state.focus===2} theme={theme} inset={g.inset} paddingY={g.paddingY}>
          <StatusRow label="Compared" status={`${s.comparedFiles} change records`} tone="foreground" width={g.leftInner} theme={theme} separator/>
          <StatusRow label="Source files" status={`${s.sourceFiles} recorded`} tone="foreground" width={g.leftInner} theme={theme} separator/>
          <StatusRow label="Artifact files" status={`${s.artifactFiles} recorded`} tone="foreground" width={g.leftInner} theme={theme} separator/>
          {s.unknownRemainingScope&&<StatusRow label="Remaining scope" status="Unknown" tone="warning" width={g.leftInner} theme={theme} separator/>}
          <Box height={g.sectionGap}/>
          <Divider width={g.leftInner} label="Coverage gaps" theme={theme}/>
          {g.omissionLines.map((text,i)=><Row key={i} width={g.leftInner} theme={theme} tone="muted">{text}</Row>)}
        </Panel>
      </Box>
      <Box width={g.right} flexDirection="column">
        <Panel width={g.right} height={g.findingHeight} title="Priority findings" meta={s.findings.length?`${s.findings.length} recorded`:s.unknownRemainingScope?'Not evaluated':'None recorded'} focused={state.focus===1} theme={theme} inset={g.inset} paddingY={g.paddingY}>
          {g.selected?<>
            {g.multiple&&<>
              {g.titleRows.map(({finding:f,lines},findingIndex)=><React.Fragment key={f.findingId}>
                {findingIndex>0&&<Box height={g.findingGap}/>}
                {lines.map((text,i)=><Row key={i} width={g.rightInner} theme={theme} bold={f===g.selected} selected={f===g.selected}>{i===0&&f===g.selected&&state.focus!==1?` ${text.slice(1)}`:text}</Row>)}
              </React.Fragment>)}
              <Box height={g.sectionGap}/>
              <Divider width={g.rightInner} theme={theme}/>
            </>}
            {!g.multiple&&g.selectedTitle.map((text,i)=><Row key={i} width={g.rightInner} theme={theme} bold>{text}</Row>)}
            <Row width={g.rightInner} theme={theme} tone="muted">{`Priority ${g.selected.reviewPriority} / Severity ${g.selected.severity}`}</Row>
            <Box height={g.previewGap}/>
            {g.observation.map((text,i)=><Row key={i} width={g.rightInner} theme={theme}>{text}</Row>)}
            {g.significance.map((text,i)=><Row key={i} width={g.rightInner} theme={theme} tone="muted">{text}</Row>)}
            <Box height={g.previewGap}/>
            <StatusRow label="Evidence confidence" status={g.selected.evidenceConfidence} tone="foreground" width={g.rightInner} theme={theme}/>
            <StatusRow label="Explanation" status={g.selected.explanationStrength.replaceAll('_',' ')} tone={['unexplained','hypothesis'].includes(g.selected.explanationStrength)?'warning':'foreground'} width={g.rightInner} theme={theme}/>
          </>:wrap(emptyFindingCopy(s),g.rightInner).map((text,i)=><Row key={i} width={g.rightInner} theme={theme} tone={s.outcomes.analysisCompleteness==='complete'?'muted':'warning'}>{text}</Row>)}
          <StatusRow label="AI" status={s.ai.status} tone={s.ai.status==='failed'?'error':'muted'} width={g.rightInner} theme={theme}/>
        </Panel>
        <Box height={g.stackGap}/>
        <Panel width={g.right} height={g.nextHeight} title="Report next action" focused={state.focus===3} theme={theme} inset={g.inset} paddingY={g.paddingY}>
          {g.actionLines.map((text,i)=><Row key={i} width={g.rightInner} theme={theme} bold>{text}</Row>)}
        </Panel>
      </Box>
    </Box>
  </>;
}
