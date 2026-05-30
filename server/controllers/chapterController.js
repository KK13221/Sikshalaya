const { Chapter, Assessment } = require('../models')

exports.list = async (req, res) => {
  const { classNum, subjectId, schoolId } = req.query
  const where = { schoolId: schoolId || req.user.schoolId }
  if (classNum) where.classNum = classNum
  if (subjectId) where.subjectId = subjectId

  const chapters = await Chapter.findAll({ where, order: [['classNum','ASC'],['chapterNumber','ASC']] })
  res.json({ success: true, data: chapters })
}

exports.create = async (req, res) => {
  const data = { ...req.body, createdBy: req.user.id, schoolId: req.body.schoolId || req.user.schoolId }
  const chapter = await Chapter.create(data)
  res.status(201).json({ success: true, data: chapter })
}

exports.update = async (req, res) => {
  const chapter = await Chapter.findByPk(req.params.id)
  if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' })
  await chapter.update(req.body)
  res.json({ success: true, data: chapter })
}

exports.remove = async (req, res) => {
  const chapter = await Chapter.findByPk(req.params.id)
  if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' })
  const refs = await Assessment.count({ where: { chapterId: chapter.id } })
  if (refs > 0) return res.status(400).json({ success: false, message: 'Cannot delete chapter with existing assessments' })
  await chapter.destroy()
  res.json({ success: true, message: 'Chapter deleted' })
}
