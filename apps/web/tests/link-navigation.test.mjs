import test from 'node:test';
import assert from 'node:assert/strict';
import { followAppLink } from '../dist/link.js';
import { createNavigator, scrollDocAnchor } from '../dist/navigation.js';
import { docPages } from '../dist/doc-model.js';
const current={origin:'http://127.0.0.1:64802',pathname:'/docs/cli'};
function click(href,patch={}) {
 const event={button:0,metaKey:false,ctrlKey:false,altKey:false,shiftKey:false,defaultPrevented:false,
  // A nested non-Element text target used to break closest()-based delegation.
  target:{nodeType:3},currentTarget:{target:'',hasAttribute:()=>false,getAttribute:k=>k==='href'?href:null},
  preventDefault(){this.defaultPrevented=true;},...patch};
 return event;
}
test('all doc sidebar/search/contents links cancel native document loads and navigate from the anchor itself',()=>{
 const navigated=[];
 for(const [id] of docPages){const href='/docs/'+id;for(const value of [href,href+'#a-section']){const event=click(value);followAppLink(event,current,path=>navigated.push(path));assert.equal(event.defaultPrevented,true,value);assert.equal(navigated.at(-1),value);}}
 const relative=click('#output-exits-and-ci');followAppLink(relative,current,path=>navigated.push(path));assert.equal(relative.defaultPrevented,true);assert.equal(navigated.at(-1),'/docs/cli#output-exits-and-ci');
 const self=click('/docs/cli');self.currentTarget.target='_self';followAppLink(self,current,path=>navigated.push(path));assert.equal(self.defaultPrevented,true);
 const keyboard=click('/workspace/new',{detail:0});followAppLink(keyboard,current,path=>navigated.push(path));assert.equal(keyboard.defaultPrevented,true);assert.equal(navigated.at(-1),'/workspace/new');
});
test('native new-tab/download/external actions remain native; links cannot grant authority or target APIs',()=>{
 for(const event of [click('/docs/cli',{ctrlKey:true}),click('/docs/cli',{metaKey:true}),click('/docs/cli',{shiftKey:true}),click('/docs/cli',{altKey:true}),click('/docs/cli',{button:1}),click('/docs/cli',{defaultPrevented:true}),click('https://example.invalid/'),click('/api/investigations'),click('/docs/cli?target=x'),click('/docs/cli#session=secret'),click('/etc/passwd')]){
  let called=false;const before=event.defaultPrevented;followAppLink(event,current,()=>called=true);assert.equal(called,false);assert.equal(event.defaultPrevented,before);
 }
 for(const target of ['_blank','_parent','_top']){const event=click('/docs/cli');event.currentTarget.target=target;followAppLink(event,current,()=>assert.fail('targeted link hijacked'));assert.equal(event.defaultPrevented,false);}
 const download=click('/docs/cli');download.currentTarget.hasAttribute=()=>true;followAppLink(download,current,()=>assert.fail('download hijacked'));assert.equal(download.defaultPrevented,false);
});
test('same-document repeated anchors scroll only the article without duplicate history or a window jump',t=>{
 class Element { isConnected=true;focus(){this.focused=true;} }
 const before=globalThis.HTMLElement;globalThis.HTMLElement=Element;t.after(()=>{globalThis.HTMLElement=before;});
 const heading=new Element();heading.getBoundingClientRect=()=>({top:220});const pane={scrollTop:100,contains:e=>e===heading,getBoundingClientRect:()=>({top:120}),querySelector:()=>heading};const focus=new Element();
 const entries=['/docs/cli'],states=[],changes=[],scrolls=[],listeners=new Map();let index=0;
 const win={location:{pathname:'/docs/cli',hash:'',origin:current.origin},scrollX:0,scrollY:350,
 document:{activeElement:focus,getElementById:id=>id==='doc-page-scroll'?pane:id==='output-exits-and-ci'?heading:null,querySelector:()=>null},
 history:{scrollRestoration:'auto',pushState(state,_,path){states.push(state);entries.push(path);index++;[win.location.pathname,win.location.hash='']=path.split(/(?=#)/);}},
 requestAnimationFrame:fn=>fn(),scrollTo:(x,y)=>scrolls.push([x,y]),addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)};
 const nav=createNavigator(win,path=>changes.push(path));
 const follow=href=>{const e=click(href);followAppLink(e,win.location,p=>nav.go(p));assert.equal(e.defaultPrevented,true);};
 follow('#output-exits-and-ci');assert.equal(entries.length,2);assert.equal(pane.scrollTop,200);assert.equal(heading.focused,true);
 win.scrollY=900;follow('#output-exits-and-ci');assert.equal(entries.length,2);assert.equal(pane.scrollTop,300);
 follow('/docs/cli');assert.equal(entries.length,3);follow('/docs/cli');assert.equal(entries.length,3);
 [win.location.pathname,win.location.hash='']=entries[--index].split(/(?=#)/);listeners.get('popstate')();assert.deepEqual(scrolls,[], 'docs transitions must leave the window and sidebar in place');
 assert.ok(states.every(s=>s===null));assert.equal(changes.at(-1),'/docs/cli');nav.dispose();assert.equal(win.history.scrollRestoration,'auto');
});

test('Analyze after scrolling down leaves the document/shell/sidebar alone; stale navigation frames cannot jump it',t=>{
 class Element{isConnected=true;}const old=globalThis.HTMLElement;globalThis.HTMLElement=Element;t.after(()=>{globalThis.HTMLElement=old;});
 const frames=[],listeners=new Map(),changes=[];let windowScrolls=0,mainFocuses=0,articleFocuses=0;
 const heading={focus:options=>{assert.equal(options.preventScroll,true);articleFocuses++;}};
 const pane={querySelector:()=>heading};const win={location:{pathname:'/',hash:''},scrollX:0,scrollY:900,
  document:{activeElement:new Element(),getElementById:id=>id==='doc-page-scroll'?pane:null,querySelector:()=>({focus(){mainFocuses++;}})},
  history:{pushState(_state,_title,path){[win.location.pathname,win.location.hash='']=path.split(/(?=#)/);}},
  requestAnimationFrame:fn=>frames.push(fn),scrollTo(){windowScrolls++;},addEventListener:(k,fn)=>listeners.set(k,fn),removeEventListener:k=>listeners.delete(k)};
 const nav=createNavigator(win,path=>changes.push(path));
 nav.go('/docs/start/quickstart');nav.go('/docs/cli/analyze');frames.splice(0).forEach(fn=>fn());
 assert.equal(changes.at(-1),'/docs/cli/analyze');assert.equal(windowScrolls,0);assert.equal(mainFocuses,0);assert.equal(articleFocuses,1);assert.equal(win.scrollY,900);
 nav.dispose();
});
test('documentation anchors scroll only their containing article and reject targets outside it',()=>{
 const heading={getBoundingClientRect:()=>({top:540}),focus:options=>assert.equal(options.preventScroll,true)};
 const pane={scrollTop:400,contains:node=>node===heading,getBoundingClientRect:()=>({top:200})};
 const doc={getElementById:id=>id==='doc-page-scroll'?pane:id==='analyze'?heading:id==='outside'?{}:null};
 assert.equal(scrollDocAnchor(doc,'#analyze'),true);assert.equal(pane.scrollTop,740);
 assert.equal(scrollDocAnchor(doc,'#outside'),false);assert.equal(scrollDocAnchor(doc,'#missing'),false);assert.equal(pane.scrollTop,740);
});
