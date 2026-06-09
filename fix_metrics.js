const { Student } = require('./server/models');
const { recomputeStudentMetrics } = require('./server/services/metricsService');

(async () => {
  const students = await Student.findAll();
  for (const s of students) {
    await recomputeStudentMetrics(s.id, s.schoolId);
  }
  console.log("Done computing metrics for " + students.length + " students");
  process.exit(0);
})();
