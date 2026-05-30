const { Op } = require('sequelize')
const { sequelize } = require('../config/db')
const { School, Student, Teacher, Attendance, Fee, Assessment, Class } = require('../models')

exports.superAdminStats = async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [totalSchools, totalStudents, totalTeachers, newSchools, byStatus, byPlan] = await Promise.all([
    School.count(),
    Student.count({ where: { isActive: true } }),
    Teacher.count({ where: { isActive: true } }),
    School.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
    School.findAll({ attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']], group: ['status'], raw: true }),
    School.findAll({ attributes: ['plan',   [sequelize.fn('COUNT', sequelize.col('id')), 'count']], group: ['plan'],   raw: true }),
  ])

  res.json({
    success: true,
    data: {
      totalSchools,
      totalStudents,
      totalTeachers,
      newSchoolsThisMonth: newSchools,
      byStatus: Object.fromEntries(byStatus.map(x => [x.status, Number(x.count)])),
      byPlan:   Object.fromEntries(byPlan.map(x => [x.plan,   Number(x.count)])),
    },
  })
}

exports.principalStats = async (req, res) => {
  // Superadmin can pass ?schoolId= to view any branch's stats
  const schoolId = req.user.role === 'superadmin'
    ? (req.query.schoolId ? Number(req.query.schoolId) : req.user.schoolId)
    : req.user.schoolId
  if (!schoolId) return res.status(400).json({ success: false, message: 'No school assigned' })

  const todayStr = new Date().toISOString().slice(0, 10)

  // Last 30 days for attendance trend
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const [totalStudents, totalTeachers, allClasses, todayAttendance, recentAttendance, feeSummary, pendingAssessments] = await Promise.all([
    Student.count({ where: { schoolId, isActive: true } }),
    Teacher.count({ where: { schoolId, isActive: true } }),
    Class.findAll({ where: { schoolId }, attributes: ['id', 'name', 'section'] }),
    Attendance.findAll({ where: { schoolId, date: todayStr } }),
    Attendance.findAll({
      where: { schoolId, date: { [Op.between]: [thirtyDaysAgo, todayStr] } },
      order: [['date', 'ASC']],
    }),
    Fee.findAll({
      where: { schoolId },
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count'], [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalAmt'], [sequelize.fn('SUM', sequelize.col('paidAmount')), 'paidAmt']],
      group: ['status'], raw: true,
    }),
    Assessment.count({ where: { schoolId, status: { [Op.in]: ['draft', 'active', 'scheduled'] } } }),
  ])

  // Today's attendance stats
  const presentToday = todayAttendance.reduce((sum, r) =>
    sum + (r.records || []).filter(x => x.status === 'present').length, 0)
  const totalMarked = todayAttendance.reduce((sum, r) => sum + (r.records || []).length, 0)
  const classesMarkedToday = todayAttendance.length
  const classesMissingToday = allClasses.filter(c => !todayAttendance.find(a => a.classId === c.id))

  // Attendance trend (last 30 days): daily percentage
  const attendanceTrend = recentAttendance.map(r => {
    const total = (r.records || []).length
    const present = (r.records || []).filter(x => x.status === 'present').length
    return { date: r.date, pct: total ? Math.round((present / total) * 100) : 0 }
  })

  const pendingFees = feeSummary.find(x => x.status === 'pending')
  const overdueFees = feeSummary.find(x => x.status === 'overdue')

  res.json({
    success: true,
    data: {
      totalStudents,
      totalTeachers,
      attendance: {
        present: presentToday,
        total: totalMarked,
        pct: totalMarked ? Math.round((presentToday / totalMarked) * 100) : 0,
      },
      classesMarked: `${classesMarkedToday}/${allClasses.length} classes`,
      classesMissing: classesMissingToday.map(c => `${c.name} ${c.section}`).join(' · ') || 'None',
      marksPending: pendingAssessments,
      pendingFeeAmount: (Number(pendingFees?.totalAmt) || 0) - (Number(pendingFees?.paidAmt) || 0),
      pendingFeeCount: (Number(pendingFees?.count) || 0) + (Number(overdueFees?.count) || 0),
      attendanceTrend,
    },
  })
}
