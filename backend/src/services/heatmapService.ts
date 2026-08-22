export type HeatmapCell = {
  id: string;
  label: string;
  type: 'BLOCK' | 'MESS';
  totalReports: number;
  recentReports: number;
  riskLevel: 'NORMAL' | 'WATCH' | 'SUSPICIOUS' | 'HIGH';
  trend: number;
  affectedStudents: number;
  recentCases: number;
  reportsWithinWindow: number;
  exampleSymptoms: string[];
  suspectedExposures: Array<{ label: string; associationScore: number; type: 'MESS' | 'BLOCK' | 'WATER' }>; 
};

export type MessExposureAlert = {
  mess: string;
  meal: string;
  associationScore: number;
  riskLevel: 'NORMAL' | 'WATCH' | 'SUSPICIOUS' | 'HIGH';
  reportsAssociated: number;
  casesExposed: number;
  summary: string;
};

const getRiskLevelFromSignals = (reportCount: number, symptomSimilarity: number) => {
  if (reportCount >= 5 || (reportCount >= 3 && symptomSimilarity >= 0.5)) return 'HIGH';
  if (reportCount >= 3 || (reportCount >= 2 && symptomSimilarity >= 0.3)) return 'SUSPICIOUS';
  if (reportCount >= 2 || symptomSimilarity >= 0.15) return 'WATCH';
  return 'NORMAL';
};

export function buildHeatmapData(reports: Array<Record<string, any>>, hoursWindow = 24) {
  const cutoff = Date.now() - hoursWindow * 60 * 60 * 1000;
  const groups = new Map<string, { label: string; type: 'BLOCK' | 'MESS'; reports: any[] }>();

  for (const report of reports) {
    const ts = new Date(report.onsetDateTime ?? report.onsetAt ?? report.createdAt ?? Date.now()).getTime();
    if (Number.isNaN(ts) || ts < cutoff) continue;

    const blockKey = `BLOCK:${report.block ?? 'Unknown Block'}`;
    const messKey = `MESS:${report.mess ?? 'Unknown Mess'}`;

    const blockEntry = groups.get(blockKey) ?? { label: report.block ?? 'Unknown Block', type: 'BLOCK', reports: [] as any[] };
    blockEntry.reports.push(report);
    groups.set(blockKey, blockEntry);

    if (report.mess) {
      const messEntry = groups.get(messKey) ?? { label: report.mess, type: 'MESS', reports: [] as any[] };
      messEntry.reports.push(report);
      groups.set(messKey, messEntry);
    }
  }

  const cells: HeatmapCell[] = [];

  for (const [key, entry] of groups.entries()) {
    const totalReports = entry.reports.length;
    const affectedStudents = new Set(entry.reports.map((report) => report.studentId ?? report.student?.id ?? report.email ?? report.hostel)).size;
    const recentReports = entry.reports.length;
    const symptomTokens = entry.reports.flatMap((report) => Array.isArray(report.symptoms) ? report.symptoms : [report.symptoms]).filter(Boolean);
    const exampleSymptoms = Array.from(new Set(symptomTokens)).slice(0, 4);
    const symptomSimilarity = symptomTokens.length > 0 ? Math.min(1, recentReports / Math.max(2, symptomTokens.length)) : 0;
    const riskLevel = getRiskLevelFromSignals(recentReports, symptomSimilarity);
    const trend = Math.min(220, Math.round((recentReports / Math.max(1, totalReports || 1)) * 100));
    const suspectedExposures = [
      { label: entry.type === 'MESS' ? `${entry.label} meal exposure` : `${entry.label} residential cluster`, associationScore: Math.min(0.96, 0.35 + recentReports * 0.11 + symptomSimilarity * 0.2), type: entry.type },
    ];

    cells.push({
      id: key,
      label: entry.label,
      type: entry.type,
      totalReports,
      recentReports,
      riskLevel,
      trend,
      affectedStudents,
      recentCases: recentReports,
      reportsWithinWindow: recentReports,
      exampleSymptoms,
      suspectedExposures,
    });
  }

  return cells.sort((left, right) => right.recentReports - left.recentReports);
}

export function buildMessExposureAlerts(reports: Array<Record<string, any>>, hoursWindow = 24) {
  const cutoff = Date.now() - hoursWindow * 60 * 60 * 1000;
  const groups = new Map<string, { mess: string; meal: string; reports: any[] }>();

  for (const report of reports) {
    const ts = new Date(report.onsetDateTime ?? report.onsetAt ?? report.createdAt ?? Date.now()).getTime();
    if (Number.isNaN(ts) || ts < cutoff) continue;
    if (!report.mess) continue;

    const key = `${report.mess}|${report.meal ?? 'Unknown meal'}`;
    const entry = groups.get(key) ?? { mess: report.mess, meal: report.meal ?? 'Unknown meal', reports: [] as any[] };
    entry.reports.push(report);
    groups.set(key, entry);
  }

  return Array.from(groups.values())
    .map((entry) => {
      const reportsAssociated = entry.reports.length;
      const casesExposed = new Set(entry.reports.map((report) => report.studentId ?? report.email ?? report.hostel)).size;
      const symptomTokens = entry.reports.flatMap((report) => Array.isArray(report.symptoms) ? report.symptoms : [report.symptoms]).filter(Boolean);
      const symptomSimilarity = symptomTokens.length > 0 ? Math.min(1, reportsAssociated / Math.max(2, symptomTokens.length)) : 0;
      const associationScore = Math.min(0.96, 0.4 + reportsAssociated * 0.09 + symptomSimilarity * 0.3);
      const riskLevel = getRiskLevelFromSignals(reportsAssociated, symptomSimilarity);

      return {
        mess: entry.mess,
        meal: entry.meal,
        associationScore: Number(associationScore.toFixed(2)),
        riskLevel,
        reportsAssociated,
        casesExposed,
        summary: `Increased illness reports have been associated with ${entry.mess} during ${entry.meal}. This is a suspected common exposure requiring investigation.`,
      } satisfies MessExposureAlert;
    })
    .sort((a, b) => b.associationScore - a.associationScore);
}
