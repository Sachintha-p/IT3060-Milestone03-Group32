const http = require('http');

const run = async () => {
  for (const type of ['USAGE', 'OCCUPANCY', 'BOOKS', 'USERS']) {
    const repData = JSON.stringify({ type, dateFrom: '2026-09-08', dateTo: '2026-10-08' });
    
    await new Promise(resolve => {
      const req2 = http.request('http://localhost:8080/api/feature4/reports/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(repData) }
      }, (res2) => {
        let r = '';
        res2.on('data', c => r += c);
        res2.on('end', () => {
          const resParsed = JSON.parse(r);
          const report = resParsed.data;
          console.log(`\n\n--- REPORT TYPE: ${type} ---`);
          if (!report || !report.result) {
              console.log("No report data:", resParsed);
              return resolve();
          }
          console.log(JSON.stringify(report.result.metrics, null, 2));
          
          const lines = [];
          lines.push(`Report Type,${report.type}`);
          lines.push(`Date Range,${report.dateFrom} to ${report.dateTo}`);
          lines.push(`Generated At,${new Date(report.createdAt).toLocaleString()}`);
          lines.push('');
          lines.push('Section,Label,Value,Source');
          report.result.metrics.forEach(m => lines.push(`${m.key},${m.label},${m.value},${m.source || ''}`));
          lines.push('');
          lines.push(`Data sources: ${report.result.dataSources.join(', ')}`);
          
          console.log(`\n--- CSV (${type}) FIRST 20 LINES ---`);
          console.log(lines.slice(0, 20).join('\n'));
          resolve();
        });
      });
      req2.write(repData);
      req2.end();
    });
  }
};
run();
