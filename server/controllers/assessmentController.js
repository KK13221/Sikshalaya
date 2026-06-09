const { Assessment, Mark, Student, Chapter } = require('../models')
const { recomputeStudentMetrics } = require('../services/metricsService')

exports.getTypes = async (req, res, next) => {
  try {
    const { AssessmentType } = require('../models')
    const { Op } = require('sequelize')
    const types = await AssessmentType.findAll({
      where: {
        schoolId: { [Op.or]: [null, req.user.schoolId] }
      }
    })
    res.json({ success: true, data: types })
  } catch (err) {
    next(err)
  }
}

exports.createType = async (req, res, next) => {
  try {
    const { code, label, sublabel, color, showInReport } = req.body
    const schoolId = req.user.schoolId
    const { AssessmentType } = require('../models')

    if (!code || !label || !color) {
      return res.status(400).json({ success: false, message: 'Code, Label, and Color are required' })
    }

    const existing = await AssessmentType.findOne({ where: { schoolId, code } })
    if (existing) {
      return res.status(400).json({ success: false, message: 'A test type with this code already exists' })
    }

    const type = await AssessmentType.create({
      schoolId,
      code,
      label,
      sublabel,
      color,
      showInReport: showInReport !== undefined ? !!showInReport : true
    })
    res.json({ success: true, data: type })
  } catch (err) { next(err) }
}

exports.updateType = async (req, res, next) => {
  try {
    const { id } = req.params
    const { label, sublabel, color, showInReport } = req.body
    const schoolId = req.user.schoolId
    const { AssessmentType } = require('../models')

    const type = await AssessmentType.findOne({ where: { id, schoolId } })
    if (!type) {
      return res.status(404).json({ success: false, message: 'Test type not found or cannot be edited' })
    }

    if (label) type.label = label
    if (sublabel !== undefined) type.sublabel = sublabel
    if (color) type.color = color
    if (showInReport !== undefined) type.showInReport = !!showInReport
    
    await type.save()
    res.json({ success: true, data: type })
  } catch (err) { next(err) }
}

exports.deleteType = async (req, res, next) => {
  try {
    const { id } = req.params
    const schoolId = req.user.schoolId
    const { AssessmentType, Assessment } = require('../models')

    const type = await AssessmentType.findOne({ where: { id, schoolId } })
    if (!type) {
      return res.status(404).json({ success: false, message: 'Test type not found or cannot be deleted' })
    }

    // Check if used in assessments
    const inUseCount = await Assessment.count({ where: { schoolId, type: type.code } })
    if (inUseCount > 0) {
      return res.status(400).json({ success: false, message: `Cannot delete: this test type is used in ${inUseCount} assessment(s).` })
    }

    await type.destroy()
    res.json({ success: true, message: 'Test type deleted successfully' })
  } catch (err) { next(err) }
}

exports.list = async (req, res, next) => {
  try {
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
  } catch (err) { next(err) }
}

exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body, createdBy: req.user.id, schoolId: req.body.schoolId || req.user.schoolId }

    // Resolve active academic year if not provided
    if (!data.academicYear) {
      const { SchoolSettings } = require('../models')
      const settings = await SchoolSettings.findOne({ where: { schoolId: data.schoolId } })
      data.academicYear = settings ? settings.academicYear : '2025-26'
    }

    // Mobile app passes classId inside the `classNum` field.
    // We need to resolve this to the actual class number and section for the database.
    const { Class } = require('../models')
    const cls = await Class.findByPk(data.classNum)
    if (cls) {
      const actualNum = parseInt(cls.name.replace(/\D/g, ''), 10) || 0
      data.classNum = actualNum
      data.section = cls.section
    }

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

    if (!data.title) {
      const { AssessmentType } = require('../models')
      const { Op } = require('sequelize')
      const typeObj = await AssessmentType.findOne({
        where: {
          schoolId: { [Op.or]: [null, data.schoolId] },
          code: data.type
        }
      })
      const typeLabel = typeObj ? typeObj.label : data.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      data.title = `${typeLabel} · ${data.subjectId}`
    }

    const assessment = await Assessment.create(data)
    res.status(201).json({ success: true, data: assessment })
  } catch (err) { next(err) }
}

exports.getMarks = async (req, res, next) => {
  try {
    const { id } = req.params
    const marks = await Mark.findAll({
      where: { assessmentId: id },
      include: [{ model: Student, attributes: ['id','name','admissionNo','rollNo','section'] }],
    })
    res.json({ success: true, data: marks })
  } catch (err) { next(err) }
}

exports.upsertMark = async (req, res, next) => {
  try {
    const { id: assessmentId, studentId } = req.params
    const assessment = await Assessment.findByPk(assessmentId)
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' })
    if (assessment.status === 'published') {
      return res.status(403).json({ success: false, message: 'Cannot edit published assessment marks' })
    }

    const { marksObtained, writtenMarks, oralMarks, isAbsent, tags, note } = req.body

    let finalMarks = marksObtained
    let finalWritten = null
    let finalOral = null

    if (!isAbsent) {
      if (assessment.type.startsWith('SA')) {
        const w = parseFloat(writtenMarks) || 0
        const o = parseFloat(oralMarks) || 0
        if (w < 0 || w > 50) {
          return res.status(400).json({ success: false, message: 'Written marks must be between 0 and 50' })
        }
        if (o < 0 || o > 10) {
          return res.status(400).json({ success: false, message: 'Oral marks must be between 0 and 10' })
        }
        finalWritten = w
        finalOral = o
        finalMarks = w + o
      } else if (assessment.type.startsWith('FA')) {
        const m = parseFloat(marksObtained) || 0
        if (m < 0 || m > 20) {
          return res.status(400).json({ success: false, message: 'Formative marks must be between 0 and 20' })
        }
        finalMarks = m
      } else {
        const m = parseFloat(marksObtained) || 0
        if (m < 0 || m > assessment.maxMarks) {
          return res.status(400).json({ success: false, message: `Marks must be 0–${assessment.maxMarks}` })
        }
        finalMarks = m
      }
    }

    const [mark] = await Mark.upsert({
      assessmentId: Number(assessmentId),
      studentId: Number(studentId),
      marksObtained: isAbsent ? null : finalMarks,
      writtenMarks: isAbsent ? null : finalWritten,
      oralMarks: isAbsent ? null : finalOral,
      isAbsent: !!isAbsent,
      tags: tags || [],
      note: note || null,
      enteredBy: req.user.id,
    }, { returning: true })

    // Async metric recompute (don't await — respond fast)
    recomputeStudentMetrics(Number(studentId), assessment.schoolId).catch(console.error)

    res.json({ success: true, data: mark })
  } catch (err) { next(err) }
}

exports.submit = async (req, res, next) => {
  try {
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

    try {
      const { logActivity } = require('../services/activityService')
      const label = assessment.name || assessment.type
      await logActivity(req, 'published', `${label} results — class ${assessment.classNum}`, { schoolId: assessment.schoolId })
    } catch (err) {
      console.error('Failed to log submit activity:', err)
    }

    res.json({ success: true, data: assessment })
  } catch (err) { next(err) }
}

exports.publish = async (req, res, next) => {
  try {
    const { schoolId, termId, classNum } = req.body
    if (!['superadmin','principal'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only principals can publish results' })
    }

    const where = { schoolId, termId, classNum, type: 'term_exam', status: 'completed' }
    const updated = await Assessment.update({ status: 'published' }, { where })

    try {
      const { logActivity } = require('../services/activityService')
      await logActivity(req, 'published', `${termId} results — class ${classNum}`, { schoolId })
    } catch (err) {
      console.error('Failed to log publish activity:', err)
    }

    res.json({ success: true, message: `Published ${updated[0]} assessments` })
  } catch (err) { next(err) }
}
