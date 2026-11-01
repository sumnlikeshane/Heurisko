import * as fs from 'node:fs/promises';
import {join} from 'node:path';
export async function removeSettledTestStore(root) {
  // A failed test is not permission to erase an unresolved real parser job's
  // recovery record or mounts. Keep the private test root for exact recovery.
  for(const lock of ['.parser-lock','.write-lock']){
    try {await fs.access(join(root,'store',lock));}
    catch(error){if(error.code==='ENOENT')continue;throw error;}
    throw Error('TEST_STORE_RETAINED_FOR_PARSER_RECOVERY');
  }
  const scratch=join(root,'store','scratch');
  for(const item of await fs.readdir(scratch,{withFileTypes:true}).catch(e=>{if(e.code==='ENOENT')return [];throw e;})){
    if(item.isDirectory()&&item.name.startsWith('parser-'))throw Error('TEST_STORE_RETAINED_FOR_PARSER_RECOVERY');
  }
  await fs.rm(root,{recursive:true,force:true});
}
