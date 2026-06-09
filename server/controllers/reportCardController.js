const { Student, Mark, Assessment, Class, School, User, Teacher } = require('../models')
const { Op } = require('sequelize')

function getGrade(pct) {
  if (pct >= 91) return 'A1'
  if (pct >= 81) return 'A2'
  if (pct >= 71) return 'B1'
  if (pct >= 61) return 'B2'
  if (pct >= 51) return 'C1'
  if (pct >= 41) return 'C2'
  if (pct >= 33) return 'D'
  return 'E'
}

const getTermReportData = async (studentId, term) => {
  const student = await Student.findByPk(studentId, {
    include: [{ 
      model: Class, 
      attributes: ['id', 'name', 'section', 'academicYear', 'subjects', 'classTeacherId'],
      include: [{
        model: Teacher,
        as: 'classTeacher',
        attributes: ['id', 'userId'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['name']
        }]
      }]
    }]
  })
  if (!student) return null

  const school = await School.findByPk(student.schoolId)
  const principal = await User.findOne({
    where: { role: 'principal', schoolId: student.schoolId, isActive: true },
    attributes: ['name']
  })
  const cls = student.Class
  if (!cls) return null

  const subjects = cls.subjects || []
  
  // Define types for the selected term
  const types = term === 'SA2' ? ['FA3', 'FA4', 'SA2'] : ['FA1', 'FA2', 'SA1']
  const [fa1Type, fa2Type, saType] = types

  const classNum = parseInt(cls.name.replace(/\D/g, ''), 10) || 0

  // Fetch all completed/published assessments for this class
  const assessments = await Assessment.findAll({
    where: {
      schoolId: student.schoolId,
      classNum,
      section: cls.section,
      academicYear: cls.academicYear,
      type: { [Op.in]: types },
      status: { [Op.in]: ['completed', 'published'] }
    }
  })

  // Fetch all marks for these assessments
  const marks = await Mark.findAll({
    where: {
      assessmentId: { [Op.in]: assessments.map(a => a.id) },
      studentId: student.id
    }
  })

  const marksMap = {}
  marks.forEach(m => {
    marksMap[m.assessmentId] = m
  })

  // Compile subject-wise marks
  const scholastic = subjects.map(sub => {
    const subAssList = assessments.filter(a => a.subjectId === sub)
    
    const fa1Ass = subAssList.find(a => a.type === fa1Type)
    const fa2Ass = subAssList.find(a => a.type === fa2Type)
    const saAss = subAssList.find(a => a.type === saType)

    const fa1Mark = fa1Ass ? marksMap[fa1Ass.id] : null
    const fa2Mark = fa2Ass ? marksMap[fa2Ass.id] : null
    const saMark = saAss ? marksMap[saAss.id] : null

    const fa1Val = (fa1Mark && !fa1Mark.isAbsent) ? (fa1Mark.marksObtained || 0) : 0
    const fa2Val = (fa2Mark && !fa2Mark.isAbsent) ? (fa2Mark.marksObtained || 0) : 0
    
    // SA is split into written and oral
    const saWritten = (saMark && !saMark.isAbsent) ? (saMark.writtenMarks || 0) : 0
    const saOral = (saMark && !saMark.isAbsent) ? (saMark.oralMarks || 0) : 0
    const saVal = (saMark && !saMark.isAbsent) ? (saMark.marksObtained || (saWritten + saOral)) : 0

    const total = fa1Val + fa2Val + saVal
    const pct = total // since total is out of 100, pct is equal to total
    const grade = getGrade(pct)

    return {
      subject: sub,
      fa1: fa1Val,
      fa2: fa2Val,
      sa: saVal,
      saWritten,
      saOral,
      total,
      percentage: pct,
      grade
    }
  })

  // Calculate totals
  const totalObtained = scholastic.reduce((sum, item) => sum + item.total, 0)
  const maxPossible = subjects.length * 100
  const overallPercentage = maxPossible === 0 ? 0 : Math.round((totalObtained / maxPossible) * 1000) / 10
  const overallGrade = getGrade(overallPercentage)

  // Dynamic Class Rank Calculation
  const peers = await Student.findAll({
    where: { classId: cls.id, isActive: true }
  })

  // Calculate scores for all peers for rank
  const peerScoresPromises = peers.map(async (peer) => {
    const peerMarks = await Mark.findAll({
      where: {
        assessmentId: { [Op.in]: assessments.map(a => a.id) },
        studentId: peer.id
      }
    })
    const pMarksMap = {}
    peerMarks.forEach(m => { pMarksMap[m.assessmentId] = m })

    let scoreSum = 0
    subjects.forEach(sub => {
      const subAssList = assessments.filter(a => a.subjectId === sub)
      const fa1Ass = subAssList.find(a => a.type === fa1Type)
      const fa2Ass = subAssList.find(a => a.type === fa2Type)
      const saAss = subAssList.find(a => a.type === saType)

      const f1 = fa1Ass && pMarksMap[fa1Ass.id] && !pMarksMap[fa1Ass.id].isAbsent ? pMarksMap[fa1Ass.id].marksObtained || 0 : 0
      const f2 = fa2Ass && pMarksMap[fa2Ass.id] && !pMarksMap[fa2Ass.id].isAbsent ? pMarksMap[fa2Ass.id].marksObtained || 0 : 0
      const sa = saAss && pMarksMap[saAss.id] && !pMarksMap[saAss.id].isAbsent ? pMarksMap[saAss.id].marksObtained || ((pMarksMap[saAss.id].writtenMarks || 0) + (pMarksMap[saAss.id].oralMarks || 0)) : 0
      
      scoreSum += (f1 + f2 + sa)
    })
    return { id: peer.id, score: scoreSum }
  })

  const peerScores = await Promise.all(peerScoresPromises)
  peerScores.sort((a, b) => b.score - a.score)
  const rank = peerScores.findIndex(p => p.id === student.id) + 1

  // Attitude & Values
  const attitude = [
    { activity: 'Discipline', remark: student.behaviourScore >= 80 ? 'Very disciplined' : 'Good' },
    { activity: 'Communication Skills', remark: 'Excellent command over language' },
    { activity: 'Assignments / Projects', remark: 'Submits neat and timely work' },
    { activity: 'Punctuality', remark: student.punctualityPct >= 85 ? 'Highly regular' : 'Punctual' },
    { activity: 'Art & Craft', remark: 'Creative and active participant' },
    { activity: 'Behaviour', remark: student.behaviourScore >= 75 ? 'Polite and cooperative' : 'Needs attention' }
  ]

  let overallRemark = 'Good academic progress. Keep it up!'
  if (overallPercentage >= 90) overallRemark = 'Outstanding performance! Keep up the brilliant work.'
  else if (overallPercentage < 50) overallRemark = 'Needs regular revision and support at home.'

  return {
    student: {
      id: student.id,
      name: student.name,
      fatherName: student.guardianName || 'Father',
      rollNo: student.rollNo || '—',
      className: `${cls.name} - ${cls.section}`,
      academicYear: cls.academicYear,
      classTeacherName: cls.classTeacher?.user?.name || 'Class Teacher',
      principalName: principal?.name || 'Principal'
    },
    school: {
      name: school.name,
      logo: school.logo || '/logo.jpeg',
      address: [school.addressLine1, school.city, school.state, school.pincode].filter(Boolean).join(', ') || 'School Location'
    },
    term,
    scholastic,
    summary: {
      totalObtained,
      maxPossible,
      overallPercentage,
      overallGrade,
      rank
    },
    attitude,
    overallRemark
  }
}

exports.getStudentReport = async (req, res, next) => {
  try {
    const { studentId } = req.params
    const { term = 'SA1' } = req.query
    
    // Permission check
    const student = await Student.findByPk(studentId)
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' })
    
    if (req.user.role !== 'superadmin' && student.schoolId !== req.user.schoolId) {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }

    const data = await getTermReportData(Number(studentId), term)
    if (!data) return res.status(400).json({ success: false, message: 'Failed to compile report card data' })

    res.json({ success: true, data })
  } catch (err) { next(err) }
}

exports.getClassReports = async (req, res, next) => {
  try {
    const { classId } = req.params
    const { term = 'SA1' } = req.query
    
    const cls = await Class.findByPk(classId)
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' })

    if (req.user.role !== 'superadmin' && cls.schoolId !== req.user.schoolId) {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }

    const students = await Student.findAll({
      where: { classId, isActive: true },
      order: [['name', 'ASC']]
    })

    const reports = await Promise.all(students.map(s => getTermReportData(s.id, term)))
    res.json({ success: true, data: reports.filter(Boolean) })
  } catch (err) { next(err) }
}
