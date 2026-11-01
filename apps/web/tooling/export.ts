import { openObservation } from '../server/observation.js';
import { exportObservation } from './transport.js';
const args = process.argv.slice(2);
async function main() {
    if (args.length !== 6 || args[0] !== '--report' || args[2] !== '--store' || args[4] !== '--out')
        throw Error('USAGE');
    const observation = await openObservation(args[1]!, args[3]!);
    const manifest = await exportObservation(observation, args[5]!);
    process.stdout.write(JSON.stringify({ format: manifest.format, reportContentRef: manifest.reportContentRef, included: manifest.blobs.filter(b => b.status === 'included').length, omitted: manifest.blobs.filter(b => b.status === 'omitted').length, partial: manifest.partial }) + '\n');
}
main().catch(() => { process.stderr.write('EXPORT_FAILED: use a fresh destination and a validated report/store.\nUsage: node apps/web/dist/export.js --report REPORT --store STORE --out NEW_DIRECTORY\n'); process.exitCode = 1; });
