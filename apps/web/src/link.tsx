import React, { createContext, useContext, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { uiPath } from './navigation.js';
type Navigate = (destination: string) => void;
const Navigation = createContext<Navigate | null>(null);
export function NavigationProvider({ navigate, children }: { navigate: Navigate; children: ReactNode }) {
 return <Navigation.Provider value={navigate}>{children}</Navigation.Provider>;
}
// Read the anchor itself, not the nested text/icon that happened to receive a click.
// Cancel the native document request even for the current destination. Only explicit
// same-origin, admitted UI locations enter history; authority never comes from a link.
export function followAppLink(event: Pick<MouseEvent<HTMLAnchorElement>, 'defaultPrevented'|'button'|'metaKey'|'ctrlKey'|'altKey'|'shiftKey'|'currentTarget'|'preventDefault'>, current: Pick<Location,'origin'|'pathname'>, navigate: Navigate) {
 if(event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)return;
 const anchor=event.currentTarget;
 if(anchor.hasAttribute('download') || anchor.target && anchor.target !== '_self')return;
 const href=anchor.getAttribute('href');if(!href)return;
 let url: URL;try{url=new URL(href,current.origin+current.pathname);}catch{return;}
 if(url.origin!==current.origin || url.username || url.password || url.search || !uiPath(url.pathname) || new URLSearchParams(url.hash.slice(1)).has('session'))return;
 event.preventDefault();navigate(url.pathname+url.hash);
}
export function AppLink({ onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
 const navigate=useContext(Navigation);
 return <a {...props} onClick={event=>{onClick?.(event);if(navigate)followAppLink(event,window.location,navigate);}}/>;
}
