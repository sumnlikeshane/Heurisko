import {safeText} from '../terminal/safe-text.js';
const segmenter=new Intl.Segmenter('en',{granularity:'grapheme'});
export const graphemes=(value:string)=>[...segmenter.segment(value)].map(s=>s.segment);
export type EditKey={leftArrow?:boolean;rightArrow?:boolean;home?:boolean;end?:boolean;backspace?:boolean;delete?:boolean;ctrl?:boolean;meta?:boolean;tab?:boolean;upArrow?:boolean;downArrow?:boolean;return?:boolean;escape?:boolean};
/** Single-line editing, with a cursor measured in graphemes rather than UTF-16 units. */
export function editText(value:string,cursor:number,input:string,key:EditKey,limit=240) {
  const chars=graphemes(value);let position=Math.max(0,Math.min(chars.length,cursor));
  if(key.leftArrow)position=Math.max(0,position-1);
  else if(key.rightArrow)position=Math.min(chars.length,position+1);
  else if(key.home||(key.ctrl&&input==='a'))position=0;
  else if(key.end||(key.ctrl&&input==='e'))position=chars.length;
  else if(key.backspace){if(position>0)chars.splice(--position,1);}
  else if(key.delete)chars.splice(position,1);
  else if(key.ctrl&&input==='u'){chars.splice(0,position);position=0;}
  else if(key.ctrl&&input==='k')chars.splice(position);
  else if(key.ctrl&&input==='w'){
    let start=position;while(start>0&&/\s/.test(chars[start-1]!))start--;while(start>0&&!/\s/.test(chars[start-1]!))start--;
    chars.splice(start,position-start);position=start;
  }else if(!key.ctrl&&!key.meta&&!key.tab&&!key.upArrow&&!key.downArrow&&!key.return&&!key.escape) {
    if(input.length>limit*8||value.length+input.length>limit*8)return {value,cursor:position,overflow:true};
    const inserted=graphemes(safeText(input.replace(/[\r\n\t]+/g,' ')));
    if(inserted.length>Math.max(0,limit-chars.length))return {value,cursor:position,overflow:true};
    chars.splice(position,0,...inserted);position+=inserted.length;
  }
  return {value:chars.join(''),cursor:position,overflow:false};
}
