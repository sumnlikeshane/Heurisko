import stringWidth from 'string-width';
const segmenter = new Intl.Segmenter('en', {granularity:'grapheme'});
export function safeText(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f-\u009f\u061c\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/g,
    c => `\\u${c.charCodeAt(0).toString(16).padStart(4,'0')}`);
}
export function fit(value: string, width: number, ascii=false): string {
  const clean=safeText(value); width=Math.max(0,Math.floor(width));
  if(stringWidth(clean)<=width)return clean+' '.repeat(width-stringWidth(clean));
  const tail=ascii?'~':'…'; if(width===0)return '';
  let out='';
  for(const {segment} of segmenter.segment(clean)) {
    if(stringWidth(out+segment)>width-1)break;
    out+=segment;
  }
  return out+' '.repeat(Math.max(0,width-1-stringWidth(out)))+tail;
}
export function wrap(value:string,width:number):string[] {
  const lines:string[]=[]; let line='';
  for(const word of safeText(value).split(' ')) {
    if(stringWidth((line?line+' ':'')+word)<=width)line+=(line?' ':'')+word;
    else {if(line)lines.push(line);line='';
      for(const {segment} of segmenter.segment(word)) {
        if(stringWidth(segment)>width){if(line)lines.push(line);lines.push(fit(segment,width));line='';continue;}
        if(stringWidth(line+segment)>width){lines.push(line);line='';}line+=segment;
      }
    }
  }
  if(line)lines.push(line);return lines.length?lines:[''];
}
