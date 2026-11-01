// Revision-7 responsive workspace geometry, adopted unchanged.
export function workspaceLayout(columns:number,height:number,pane:number,inspecting=false,files=false,noSupport=false){
 const count=inspecting?1:!files&&!noSupport&&columns>=140&&height>=22?3:columns>=100&&height>=17?2:1;
 const width=columns-4,gap=count>1?1:0;
 const listWidth=Math.max(26,Math.floor(width*(count===3?.24:files?.24:.30)));
 const widths=count===3?[listWidth,Math.floor((width-listWidth-2)*.55),width-listWidth-2-Math.floor((width-listWidth-2)*.55)]:count===2?[listWidth,width-listWidth-gap]:[width];
 const visible=inspecting?[pane]:count===3?[0,1,2]:count===2?[0,pane===2?2:1]:[pane];
 return {count,widths,visible,capacity:Math.max(1,height-6),height:Math.max(6,height-2)};
}
