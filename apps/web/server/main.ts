import { openObservation, type Observation } from './observation.js';
import { importObservation } from '../tooling/transport.js';
import { startViewer } from './service.js';
async function main() {
    const args = process.argv.slice(2), observations: Observation[] = [];
    let port = 0;
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--report' && args[i + 1] && args[i + 2] === '--store' && args[i + 3]) {
            observations.push(await openObservation(args[i + 1]!, args[i + 3]!));
            i += 3;
        }
        else if (args[i] === '--import' && args[i + 1]) {
            observations.push(await importObservation(args[++i]!));
        }
        else if (args[i] === '--port' && /^[0-9]{1,5}$/.test(args[i + 1] ?? '')) {
            port = Number(args[++i]);
            if (port > 65535)
                throw Error('INVALID_PORT');
        }
        else
            throw Error('USAGE');
    }
    const viewer = await startViewer(observations, port);
    // Explicit local launch URL only: capability stays in fragment, never in an HTTP query or request log.
    process.stdout.write(`Heurisko · local investigation workspace\nOpen this private session URL locally (do not share):\n${viewer.url}\nExplicit analysis uses the shared static engine. Ctrl+C requests cancellation and stops access.\n`);
    for (const signal of ['SIGINT', 'SIGTERM'] as const)
        process.once(signal, () => { void viewer.close().then(() => process.exit(0)); });
}
main().catch(() => { process.stderr.write('OPEN_FAILED: local workspace could not start.\nUsage: node apps/web/dist/main.js --report REPORT --store STORE [--report REPORT --store STORE] [--import EXPORT_DIRECTORY] [--port PORT]\n'); process.exitCode = 1; });
