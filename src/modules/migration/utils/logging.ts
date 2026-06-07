import { ImportCounters } from "../types";

export function createCounters(): ImportCounters {
  return {
    read: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  };
}

export function printImportResult(label: string, counters: ImportCounters) {
  console.log(`\n[${label}]`);
  console.log(`read: ${counters.read}`);
  console.log(`created: ${counters.created}`);
  console.log(`updated: ${counters.updated}`);
  console.log(`skipped: ${counters.skipped}`);
  console.log(`failed: ${counters.failed}`);
}
