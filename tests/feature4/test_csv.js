const report = {
  type: 'USAGE',
  dateFrom: '2026-09-08',
  dateTo: '2026-10-08',
  createdAt: new Date().toISOString(),
  result: {
    metrics: [
      { key: 'total_reservations', label: 'Total Reservations', value: 150, source: 'feature1_reservations' },
      { key: 'status_1', label: 'Status 1', value: 120, source: 'feature1_reservations.status' },
      { key: 'status_2', label: 'Status 2', value: 30, source: 'feature1_reservations.status' },
      { key: 'checkin_rate', label: 'Check-in Rate', value: '80%', source: 'calculated' },
      { key: 'busiest_zone', label: 'Busiest Zone', value: 'Quiet Zone', source: 'feature1_spaces.zone' },
    ]
  }
};

const escapeCsv = (str) => {
  if (str === null || str === undefined) return '';
  const s = String(str);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

const buildCsv = (report) => {
  const lines = [];
  lines.push(`Report Type,${escapeCsv(report.type)}`);
  lines.push(`Date Range,${escapeCsv(report.dateFrom)} to ${escapeCsv(report.dateTo)}`);
  lines.push(`Generated At,${escapeCsv(new Date(report.createdAt).toLocaleString())}`);
  lines.push('');
  lines.push('Section,Label,Value,Source');
  
  if (report.result?.metrics && Array.isArray(report.result.metrics)) {
    report.result.metrics.forEach((m) => {
      lines.push(`${escapeCsv(m.key)},${escapeCsv(m.label)},${escapeCsv(m.value)},${escapeCsv(m.source || '')}`);
    });
  }
  lines.push('');
  lines.push('Data sources: Sensor logs, checkout logs, and user activity records.');
  return lines.join('\n');
};

console.log(buildCsv(report).split('\n').slice(0, 15).join('\n'));
