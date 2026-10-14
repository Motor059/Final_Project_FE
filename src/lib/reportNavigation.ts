import type { ReportResponseData } from '@/types/report';

export function validSessionId(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

export function reportSessionId(search: string, stateId: unknown): number | undefined {
  const raw = new URLSearchParams(search).get('sessionId');
  if (raw !== null) {
    if (!/^\d+$/.test(raw)) return undefined;
    const id = Number(raw);
    return validSessionId(id) ? id : undefined;
  }
  return validSessionId(stateId) ? stateId : undefined;
}

export function reportPath(sessionId: number) {
  return `/report?sessionId=${sessionId}`;
}

export function isReportSnapshot(value: unknown, sessionId: number): value is ReportResponseData {
  if (typeof value !== 'object' || value === null) return false;
  const report = value as Partial<ReportResponseData>;
  return report.sessionId === sessionId && !!report.meta && !!report.keyCoaching &&
    !!report.radar && Array.isArray(report.radar.axes) && Array.isArray(report.cards);
}
