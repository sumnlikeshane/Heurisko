// UI-only state. No report or canonical contract changes.
export type Location={section:number;subtab:number;index:number;selectedId?:string;focus:number;citation:number;scroll:number;scrolls:[number,number,number];query:string;detail:boolean;pan:number};
export const initialLocation=():Location=>({section:0,subtab:0,index:0,focus:0,citation:0,scroll:0,scrolls:[0,0,0],query:'',detail:false,pan:0});
export const locationKey=(l:Location)=>l.section===3?'3:'+l.subtab:String(l.section);
export type Filters={priority:string;severity:string;confidence:string;rule:string};
export const initialFilters=():Filters=>({priority:'all',severity:'all',confidence:'all',rule:'all'});
export type UIState={version:2;location:Location;sections:Record<string,Location>;filters:Filters;tree:boolean;collapsed:string[];diff:'auto'|'unified'|'side';overviewFinding:number};
const integer=(v:unknown,max=100000):v is number=>Number.isSafeInteger(v)&&Number(v)>=0&&Number(v)<=max;
function location(value:unknown):Location{
 const x=value as Record<string,unknown>;
 if(!x||!integer(x.section,5)||!integer(x.subtab,2)||!integer(x.index)||!integer(x.scroll)||!integer(x.focus,3)||!integer(x.pan)||typeof x.query!=='string'||x.query.length>2048||typeof x.detail!=='boolean'||x.citation!==undefined&&!integer(x.citation)||x.selectedId!==undefined&&(typeof x.selectedId!=='string'||x.selectedId.length>4096))throw Error('UI_STATE_INVALID');
 const scrolls=x.scrolls??[0,x.scroll,0];if(!Array.isArray(scrolls)||scrolls.length!==3||!scrolls.every(v=>integer(v)))throw Error('UI_STATE_INVALID');
 return {section:x.section,subtab:x.subtab,index:x.index,focus:x.focus,citation:typeof x.citation==='number'?x.citation:0,scroll:x.scroll,query:x.query,detail:false,pan:x.pan,...(typeof x.selectedId==='string'?{selectedId:x.selectedId}:{}),scrolls:[scrolls[0]!,scrolls[1]!,scrolls[2]!]};
}
export function decodeUIState(raw:string):UIState{
 if(Buffer.byteLength(raw)>128*1024)throw Error('UI_STATE_LIMIT');const data=JSON.parse(raw);
 if(data.version===1)return {version:2,location:location(data.location),sections:{},filters:initialFilters(),tree:true,collapsed:[],diff:'auto',overviewFinding:0};
 if(data.version!==2||!data.sections||typeof data.sections!=='object'||Array.isArray(data.sections)||Object.keys(data.sections).length>9||!data.filters||!['priority','severity','confidence','rule'].every(k=>typeof data.filters[k]==='string'&&data.filters[k].length<=256)||!['all','high','medium','low','informational','undetermined'].includes(data.filters.priority)||!['all','high','medium','low','informational','undetermined'].includes(data.filters.severity)||!['all','high','limited','unresolved'].includes(data.filters.confidence)||typeof data.tree!=='boolean'||!Array.isArray(data.collapsed)||data.collapsed.length>64||!data.collapsed.every((s:unknown)=>typeof s==='string'&&s.startsWith('directory:')&&s.length<=1024)||!['auto','unified','side'].includes(data.diff)||!integer(data.overviewFinding))throw Error('UI_STATE_INVALID');
 const sections:Record<string,Location>={};for(const [key,value]of Object.entries(data.sections)){if(!/^[0-5](?::[0-2])?$/.test(key))throw Error('UI_STATE_INVALID');sections[key]=location(value);}
 return {version:2,location:location(data.location),sections,filters:{priority:data.filters.priority,severity:data.filters.severity,confidence:data.filters.confidence,rule:data.filters.rule},tree:data.tree,collapsed:data.collapsed,diff:data.diff,overviewFinding:data.overviewFinding};
}
export function encodeUIState(state:UIState){const raw=JSON.stringify(state);decodeUIState(raw);return raw;}
