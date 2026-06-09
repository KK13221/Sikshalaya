const { AssessmentType } = require('./server/models');
async function run() {
  try {
    const types = await AssessmentType.findAll({
      where: {
        schoolId: [null, 4]
      }
    });
    console.log(types.map(t => t.toJSON()));
  } catch (e) {
    console.error("ERROR:", e);
  }
  process.exit();
}
run();
