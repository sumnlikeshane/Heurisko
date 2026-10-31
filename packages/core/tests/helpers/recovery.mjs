import * as fs from 'node:fs/promises';
import {join} from 'node:path';
export async function removeSettledTestStore(root) {
  // A failed test is not permission to erase an unresolved real parser job's
  // recovery record or mounts. Keep the private test root for exact recovery.
  try {await fs.access(join(root,'store','.parser-lock'));}
  catch(error){if(error.code==='ENOENT'){await fs.rm(root,{recursive:true,force:true});return;}throw error;}
  throw Error('TEST_STORE_RETAINED_FOR_PARSER_RECOVERY');
}
