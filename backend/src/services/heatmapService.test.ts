import { describe, expect, it } from 'vitest';

import { buildHeatmapData, buildMessExposureAlerts } from './heatmapService.js';

describe('heatmap and mess exposure analytics', () => {
  it('builds a block grid from real report activity and detects a strong mess association', () => {
    const reports = [
      { block: 'B3', hostel: 'Hostel A', mess: 'Mess A', meal: 'Dinner', symptoms: ['Vomiting', 'Diarrhea'], onsetDateTime: '2026-08-22T18:30:00.000Z' },
      { block: 'B3', hostel: 'Hostel A', mess: 'Mess A', meal: 'Dinner', symptoms: ['Vomiting', 'Diarrhea'], onsetDateTime: '2026-08-22T19:00:00.000Z' },
      { block: 'B3', hostel: 'Hostel A', mess: 'Mess A', meal: 'Dinner', symptoms: ['Vomiting', 'Diarrhea'], onsetDateTime: '2026-08-22T19:30:00.000Z' },
      { block: 'A2', hostel: 'Hostel A', mess: 'Mess B', meal: 'Lunch', symptoms: ['Stomach pain'], onsetDateTime: '2026-08-22T13:00:00.000Z' },
    ];

    const heatmap = buildHeatmapData(reports as any, 24);
    const block = heatmap.find((cell) => cell.label === 'B3');

    expect(block).toBeDefined();
    expect(block?.riskLevel).toBe('HIGH');
    expect(block?.recentReports).toBeGreaterThanOrEqual(3);

    const alerts = buildMessExposureAlerts(reports as any, 24);
    expect(alerts.some((alert) => alert.mess === 'Mess A' && alert.riskLevel === 'HIGH')).toBe(true);
  });
});
