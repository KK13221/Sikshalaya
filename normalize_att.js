const sq = new (require('sequelize').Sequelize)(
  process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD,
  { host: process.env.MYSQL_HOST, dialect: 'mysql', logging: false }
);
const m = { P: 'present', A: 'absent', L: 'late', p: 'present', a: 'absent', l: 'late' };
(async () => {
  const [rows] = await sq.query('SELECT id, records FROM attendance');
  let updated = 0;
  for (const row of rows) {
    const recs = typeof row.records === 'string' ? JSON.parse(row.records) : row.records;
    const norm = recs.map(r => ({ studentId: String(r.studentId), status: m[r.status] || r.status }));
    if (JSON.stringify(recs) !== JSON.stringify(norm)) {
      await sq.query('UPDATE attendance SET records=? WHERE id=?', { replacements: [JSON.stringify(norm), row.id] });
      updated++;
    }
  }
  console.log('Normalized ' + updated + ' attendance rows');
  await sq.close();
})().catch(e => { console.error(e.message); process.exit(1); });
