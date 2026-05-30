const { Assessment, Mark, Student, Chapter } = require('../models')
const { recomputeStudentMetrics } = require('../services/metricsService')

exports.list = async (req, res) => {
  const { classNum, subjectId, type, section, schoolId } = req.query
  const where = { schoolId: schoolId || req.user.schoolId }
  if (classNum) where.classNum = classNum
  if (subjectId) where.subjectId = subjectId
  if (type) where.type = type
  if (section) where.section = section

  const assessments = await Assessment.findAll({
    where, order: [['createdAt','DESC']],
    include: [{ model: Chapter, attributes: ['id','name','chapterNumber'], required: false }],
  })
  res.json({ success: true, data: assessments })
}

exports.create = async (req, res) => {
  const data = { ...req.body, createdBy: req.user.id, schoolId: req.body.schoolId || req.user.schoolId }

  // Validate chapter test has chapter
  if (data.type === 'chapter_test' && !data.chapterId) {
    return res.status(400).json({ success: false, message: 'chapterId required for chapter_test' })
  }
  if (data.chapterId) {
    const ch = await Chapter.findByPk(data.chapterId)
    if (ch && !ch.hasChapterTest) {
      return res.status(400).json({ success: false, message: 'Chapter does not allow a chapter test' })
    }
    if (!data.title && ch) data.title = `${ch.name} · Chapter Test`
    if (!data.maxMarks && ch) data.maxMarks = ch.maxMarks
  }

  const assessment = await Assessment.create(data)
  res.status(201).json({ success: true, data: assessment })
}

exports.getMarks = async (req, res) => {
  const { id } = req.params
  const marks = await Mark.findAll({
    where: { assessmentId: id },
    include: [{ model: Student, attributes: ['id','name','admissionNo','rollNo','section'] }],
  })
  res.json({ success: true, data: marks })
}

exports.upsertMark = async (req, res) => {
  const { id: assessmentId, studentId } = req.params
  const assessment = await Assessment.findByPk(assessmentId)
  if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' })
  if (assessment.status === 'published') {
    return res.status(403).json({ success: false, message: 'Cannot edit published assessment marks' })
  }

  const { marksObtained, isAbsent, tags, note } = req.body

  // Validate
  if (!isAbsent && marksObtained != null) {
    if (marksObtained < 0 || marksObtained > assessment.maxMarks) {
      return res.status(400).json({ success: false, message: `Marks must be 0–${assessment.maxMarks}` })
    }
  }

  const [mark] = await Mark.upsert({
    assessmentId: Number(assessmentId),
    studentId: Number(studentId),
    marksObtained: isAbsent ? null : marksObtained,
    isAbsent: !!isAbsent,
    tags: tags || [],
    note: note || null,
    enteredBy: req.user.id,
  }, { returning: true })

  // Async metric recompute (don't await — respond fast)
  recomputeStudentMetrics(Number(studentId), assessment.schoolId).catch(console.error)

  res.json({ success: true, data: mark })
}

exports.submit = async (req, res) => {
  const assessment = await Assessment.findByPk(req.params.id)
  if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' })
  await assessment.update({ status: 'completed', conductedOn: new Date() })

  // If chapter test, flip chapter to done
  if (assessment.chapterId) {
    const Chapter = require('../models/Chapter')
    await Chapter.update({ status: 'done', completedAt: new Date() }, { where: { id: assessment.chapterId } })
  }

  // Recompute metrics for all students who have marks in this assessment
  const marks = await Mark.findAll({ where: { assessmentId: assessment.id } })
  marks.forEach(m => recomputeStudentMetrics(m.studentId, assessment.schoolId).catch(console.error))

  res.json({ success: true, data: assessment })
}

exports.publish = async (req, res) => {
  const { schoolId, termId, classNum } = req.body
  if (!['superadmin','principal'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Only principals can publish results' })
  }

  const where = { schoolId, termId, classNum, type: 'term_exam', status: 'completed' }
  const updated = await Assessment.update({ status: 'published' }, { where })
  res.json({ success: true, message: `Published ${updated[0]} assessments` })
}
