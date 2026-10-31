import { randomBytes } from 'node:crypto';
import { boundedFile } from '@heurisko/core';
import { ReportReader, readerLimits, reportFacts } from '../../../integration/part4/dist/report-reader.js';
export { ReportReader, readerLimits, reportFacts };
export interface Observation {
    handle: string;
    reader: ReportReader;
    raw: Buffer;
    transport?: {
        format: string;
        exportedAt: string;
        included: number;
        omitted: number;
        notices: string[];
        omissions: {
            contentRef: string;
            reason: string;
        }[];
    };
}
export async function openObservation(reportPath: string, storeRoot: string, signal?: AbortSignal): Promise<Observation> {
    const raw = await boundedFile(reportPath, readerLimits.reportBytes);
    return observationFromBytes(raw, storeRoot, signal);
}
export async function observationFromBytes(raw: Buffer, storeRoot: string, signal?: AbortSignal): Promise<Observation> {
    if (!raw.length || raw.length > readerLimits.reportBytes) throw Error('REPORT_SIZE_LIMIT');
    let text: string;
    try {
        text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(raw);
    }
    catch {
        throw Error('REPORT_ENCODING_INVALID');
    }
    const reader = await ReportReader.openJSON(text, storeRoot, { signal });
    return { handle: randomBytes(16).toString('hex'), reader, raw };
}
