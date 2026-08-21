import axios from 'axios';

export interface ReportAnalyticsInput {
  report: unknown;
  recentReports: unknown[];
}

export async function analyzeReport(input: ReportAnalyticsInput) {
  const url = process.env.PYTHON_ANALYTICS_URL;
  if (!url) {
    return { available: false, riskLevel: 'UNKNOWN', evidence: ['Analytics service URL not configured'] };
  }

  try {
    const response = await axios.post(`${url}/analyze`, input, {
      timeout: 2500,
      headers: { 'x-analytics-secret': process.env.ANALYTICS_SECRET ?? '' },
    });
    return response.data;
  } catch (error) {
    console.warn('Analytics service unavailable; report stored without analytics result');
    return { available: false, riskLevel: 'PENDING', evidence: ['Analytics service unavailable; queued for review'] };
  }
}
