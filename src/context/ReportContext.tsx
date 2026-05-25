import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchReportDetail } from '@/api';
import type { ReportDetail, InlineCorrection, ReportResultEntry } from '@/types/api';

// ── Rapor içindeki kriter sonucu (result: unknown'dan cast edilir) ──
export type CriteriaResult = {
  criterion?: string;
  score?: number;
  observation?: string;
  achievements?: string[];
  issues?: (string | InlineCorrection)[];
};

export function isInlineCorrection(v: unknown): v is InlineCorrection {
  return typeof v === 'object' && v !== null && 'wrongWord' in v;
}

export function getCriteriaEntry(
  result: ReportResultEntry[],
  keyword: string,
): CriteriaResult | null {
  const entry = result.find(e => {
    const nameMatch = e.name.toLowerCase().includes(keyword);
    const criterionMatch = typeof (e.result as CriteriaResult)?.criterion === 'string' &&
      ((e.result as CriteriaResult).criterion ?? '').toLowerCase().includes(keyword);
    return nameMatch || criterionMatch;
  });
  return entry ? (entry.result as CriteriaResult) : null;
}

export function scoreToCefr(score: number): string {
  if (score >= 8.5) return 'C1';
  if (score >= 7.5) return 'B2+';
  if (score >= 6.5) return 'B2';
  if (score >= 5.5) return 'B1+';
  if (score >= 4.5) return 'B1';
  if (score >= 3.5) return 'A2+';
  return 'A2';
}

export function findScore(scores: Record<string, number>, keyword: string): number {
  const key = Object.keys(scores).find(k => k.toLowerCase().includes(keyword));
  return key ? scores[key] : 0;
}

// ── Context ─────────────────────────────────────────────────────────
type Ctx = { report: ReportDetail | null; loading: boolean; error: boolean };

const ReportContext = createContext<Ctx>({ report: null, loading: true, error: false });

export function ReportProvider({
  solvedTaskId, children,
}: { solvedTaskId: string; children: React.ReactNode }) {
  const [report,  setReport]  = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    if (!solvedTaskId) { setLoading(false); return; }
    fetchReportDetail(solvedTaskId)
      .then(res => setReport(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [solvedTaskId]);

  return (
    <ReportContext.Provider value={{ report, loading, error }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReport() {
  return useContext(ReportContext);
}
