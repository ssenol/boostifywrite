import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchReportDetail } from '@/api';
import type { ReportDetail, InlineCorrection, ReportResultEntry, CriteriaFeedback } from '@/types/api';

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

// "feedback" entry'sinden genel markdown metnini döndürür.
// Bu, rubric-bazlı değil holistic feedback kullanan görev tipleri için geçerlidir.
export function getGlobalFeedback(result: ReportResultEntry[]): string {
  const entry = result.find(e => e.name === 'feedback');
  return typeof entry?.result === 'string' ? entry.result : '';
}

// result → questionInfo → result → cefrLevel (hedef seviye)
export function getTargetCefrLevel(result: ReportResultEntry[]): string | null {
  const entry = result.find(e => e.name === 'questionInfo');
  if (!entry) return null;
  return (entry.result as { cefrLevel?: string })?.cefrLevel ?? null;
}

// result → questionInfo → result → questionText (prompt metni, HTML olabilir)
export function getQuestionText(result: ReportResultEntry[]): string | null {
  const entry = result.find(e => e.name === 'questionInfo');
  if (!entry) return null;
  return (entry.result as { questionText?: string })?.questionText ?? null;
}

// result → userResponse → result (öğrencinin cevap metni)
export function getUserResponseText(result: ReportResultEntry[]): string | null {
  const entry = result.find(e => e.name === 'userResponse');
  if (!entry) return null;
  const r = entry.result;
  if (typeof r === 'string') return r;
  return (r as { result?: string })?.result ?? null;
}


export type CefrEvidenceData = {
  detected: string;
  evidence: string;
  gap:      string | number;
};

// result → all-feedback → result → userResponseCEFRLevel
export function getUserResponseCefrEvidence(result: ReportResultEntry[]): CefrEvidenceData | null {
  const entry = result.find(e => e.name === 'all-feedback');
  if (!entry) return null;
  const r = entry.result as { userResponseCEFRLevel?: CefrEvidenceData };
  return r?.userResponseCEFRLevel ?? null;
}

// result → all-feedback → result → rubricCriteriaFeedback listesini döndürür
export function getRubricCriteriaFeedback(result: ReportResultEntry[]): CriteriaFeedback[] {
  const entry = result.find(e => e.name === 'all-feedback');
  if (!entry) return [];
  const r = entry.result as { rubricCriteriaFeedback?: CriteriaFeedback[] };
  return r?.rubricCriteriaFeedback ?? [];
}

// ── Sandwich Feedback tipleri + helper ──────────────────────────────────────
export type SandwichPoint = { label: string; detail: string };
export type FillingPoint  = {
  label: string; criterion: string;
  issue: string; before: string; after: string; tip: string;
};
export type SandwichFeedback = {
  topBread:    { title: string; points: SandwichPoint[] };
  filling:     { title: string; points: FillingPoint[]  };
  bottomBread: { title: string; summary: string; nextSteps: string[] };
};

export function getSandwichFeedback(result: ReportResultEntry[]): SandwichFeedback | null {
  const entry = result.find(e => e.name === 'all-feedback');
  if (!entry) return null;
  const r = entry.result as { topBread?: unknown; filling?: unknown; bottomBread?: unknown };
  if (!r.topBread && !r.filling && !r.bottomBread) return null;
  return {
    topBread:    (r.topBread    as SandwichFeedback['topBread'])    ?? { title: '', points: [] },
    filling:     (r.filling     as SandwichFeedback['filling'])     ?? { title: '', points: [] },
    bottomBread: (r.bottomBread as SandwichFeedback['bottomBread']) ?? { title: '', summary: '', nextSteps: [] },
  };
}

// result → all-feedback → result → outlineCompliance listesi
export type OutlineSection = {
  section:      string;
  met:          boolean;
  score:        number;
  achievements: string[];
  issues:       string[];
  finalComment: string;
};

export function getOutlineCompliance(result: ReportResultEntry[]): OutlineSection[] {
  const entry = result.find(e => e.name === 'all-feedback');
  if (!entry) return [];
  const r = entry.result as { outlineCompliance?: OutlineSection[] };
  return r?.outlineCompliance ?? [];
}

// result[2].result[0].result içindeki AI detection verisini döndürür
export type AiSentence = {
  sentence:              string;
  generated_prob?:       number;
  perplexity?:           number;
};

export type AiDetectionDocument = {
  predicted_class:        'ai' | 'human' | 'mixed' | string;
  sentences?:             AiSentence[];
  average_generated_prob?: number;
  completely_generated_prob?: number;
};

export type AiDetectionCheck = {
  isAi:       boolean;
  document:   AiDetectionDocument | null;
};

export function getAiDetectionCheck(result: ReportResultEntry[]): AiDetectionCheck | null {
  const entry = result[2];
  if (!entry) return null;
  const innerArr = entry.result as ReportResultEntry[] | undefined;
  if (!Array.isArray(innerArr)) return null;
  const inner = innerArr[0]?.result as Record<string, unknown> | undefined;
  if (!inner) return null;
  const docs = inner.documents as AiDetectionDocument[] | undefined;
  const doc  = docs?.[0] ?? null;
  if (!doc) return null;
  return { isAi: doc.predicted_class === 'ai', document: doc };
}

// result[0] içindeki plagiarism check verisini döndürür
export type PlagiarismHighestMatch = {
  responseOriginal:     string;
  matchedResponse?:     string;
  overallScore:         number;
};

export type PlagiarismCheck = {
  hasPlagiarism: boolean;
  highestMatch?: PlagiarismHighestMatch;
};

export function getPlagiarismCheck(result: ReportResultEntry[]): PlagiarismCheck | null {
  const r = (result[0]?.result ?? {}) as Record<string, unknown>;
  if (typeof r.hasPlagiarism !== 'boolean') return null;
  return {
    hasPlagiarism: r.hasPlagiarism,
    highestMatch:  r.highestMatch as PlagiarismHighestMatch | undefined,
  };
}

// result[] içinde lexicalRange verisini bulur
export type AnnotatedQuote = { quote: string; note: string };
export type VocabularyUpgrade = { from: string; to?: string[]; suggestions?: string[] };
export type LexicalRange = {
  annotatedQuotes:    AnnotatedQuote[];
  vocabularyUpgrades: VocabularyUpgrade[];
};

export function getLexicalRange(result: ReportResultEntry[]): LexicalRange | null {
  for (const entry of result) {
    const r = entry.result as Record<string, unknown>;
    if (r?.lexicalRange) return r.lexicalRange as LexicalRange;
  }
  return null;
}

// result[] içinde metricsCheck.wordCount verisini bulur
export type MetricsWordCount = { required: string; met: boolean; comment: string };

export function getMetricsWordCount(result: ReportResultEntry[]): MetricsWordCount | null {
  for (const entry of result) {
    const r = entry.result as Record<string, unknown>;
    const wc = (r?.metricsCheck as Record<string, unknown>)?.wordCount;
    if (wc) return wc as MetricsWordCount;
  }
  return null;
}

// result[] içinde herhangi bir entry'nin rubricCriteriaFeedback dizisinden
// keyword ile eşleşen criterion'u bulur
export function findRubricCriteriaByKeyword(
  result: ReportResultEntry[],
  keyword: string,
): CriteriaFeedback | null {
  const fromAll = getRubricCriteriaFeedback(result).find(cf =>
    (cf.criterion ?? '').toLowerCase().includes(keyword),
  );
  if (fromAll) return fromAll;
  for (const entry of result) {
    const r = entry.result as Record<string, unknown>;
    const arr = r?.rubricCriteriaFeedback;
    if (Array.isArray(arr)) {
      const found = (arr as CriteriaFeedback[]).find(cf =>
        (cf.criterion ?? '').toLowerCase().includes(keyword),
      );
      if (found) return found;
    }
  }
  return null;
}

// InlineCorrection içeren criterion'u bulur (grammar/logic error listesi için)
export function findRubricCriteriaWithErrors(result: ReportResultEntry[]): CriteriaFeedback | null {
  for (const entry of result) {
    const r = entry.result as Record<string, unknown>;
    const arr = r?.rubricCriteriaFeedback;
    if (Array.isArray(arr)) {
      const found = (arr as CriteriaFeedback[]).find(cf =>
        Array.isArray(cf.issues) &&
        cf.issues.some(i => typeof i === 'object' && i !== null && 'wrongContent' in (i as object)),
      );
      if (found) return found;
    }
  }
  return null;
}

// string achievements içeren criterion'u bulur (grammar summary için)
export function findRubricCriteriaWithStringAchievements(
  result: ReportResultEntry[],
  keyword: string,
): CriteriaFeedback | null {
  for (const entry of result) {
    const r = entry.result as Record<string, unknown>;
    const arr = r?.rubricCriteriaFeedback;
    if (Array.isArray(arr)) {
      const found = (arr as CriteriaFeedback[]).find(cf =>
        (cf.criterion ?? '').toLowerCase().includes(keyword) &&
        Array.isArray(cf.achievements) && cf.achievements.length > 0 &&
        typeof cf.achievements[0] === 'string',
      );
      if (found) return found;
    }
  }
  return findRubricCriteriaByKeyword(result, keyword);
}

// rubricCriteriaFeedback → Mechanics criterion → issues listesi
export function getMechanicsIssues(result: ReportResultEntry[]): InlineCorrection[] {
  const feedback = getRubricCriteriaFeedback(result);
  const mechanics = feedback.find(cf => cf.criterion?.toLowerCase().includes('mechanic'));
  if (!mechanics || !Array.isArray((mechanics as any).issues)) return [];
  return ((mechanics as any).issues as unknown[]).filter(isInlineCorrection);
}

// otherCriteria → detailWritingErrorCheck içindeki InlineCorrection listesini döndürür
export function getWritingCorrections(result: ReportResultEntry[]): InlineCorrection[] {
  const other = result.find(e => e.name === 'otherCriteria');
  if (!other || !Array.isArray(other.result)) return [];
  const check = (other.result as any[]).find((x: any) => x?.name === 'detailWritingErrorCheck');
  if (!check || !Array.isArray(check.result)) return [];
  return (check.result as unknown[]).filter((x): x is InlineCorrection => isInlineCorrection(x));
}

// Markdown → basit HTML: HtmlText bileşeniyle uyumlu dönüşüm
export function feedbackMarkdownToHtml(md: string): string {
  return md
    .replace(/\*{3}\s*\n?/g, '\n\n')                      // *** ayraç → paragraf boşluğu
    .replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')           // **başlık** → <b>
    .replace(/\*([^*\n]+)\*/g, '$1')                       // *italic* → düz metin
    .replace(/\n\n+/g, '<br/><br/>')                       // paragraf arası → br
    .replace(/\n/g, ' ')                                   // satır sonu → boşluk
    .trim();
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
