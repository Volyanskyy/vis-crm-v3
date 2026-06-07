import type { PrismaClient } from "@prisma/client";

export type ImportMode = "upsert" | "skip-existing";

export type ImportCounters = {
  read: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
};

export type ImportResult = {
  key: string;
  source: string;
  target: string;
  counters: ImportCounters;
  notes: string[];
};

export type CsvRow = Record<string, string>;

export type ReferenceImportContext = {
  prisma: PrismaClient;
  tenantId: string;
  mode: ImportMode;
  dryRun: boolean;
};

export type V2ReferenceImportTask = {
  key: string;
  sourceFile: string;
  target: string;
  enabledByDefault?: boolean;
};
