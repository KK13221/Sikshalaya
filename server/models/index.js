const User             = require('./User')
const School           = require('./School')
const Student          = require('./Student')
const Teacher          = require('./Teacher')
const Class            = require('./Class')
const Attendance       = require('./Attendance')
const Fee              = require('./Fee')
const Chapter          = require('./Chapter')
const Assessment       = require('./Assessment')
const Mark             = require('./Mark')
const BehaviourLog     = require('./BehaviourLog')
const BehaviourMetric  = require('./BehaviourMetric')
const Notification     = require('./Notification')
const ActivityLog      = require('./ActivityLog')
const SchoolSettings   = require('./SchoolSettings')
const Notice           = require('./Notice')


// School associations
School.belongsTo(User,    { as: 'principal', foreignKey: 'principalId' })
User.hasMany(School,      { foreignKey: 'principalId' })
User.belongsTo(School,    { foreignKey: 'schoolId', required: false })

School.hasMany(Student,   { foreignKey: 'schoolId', onDelete: 'CASCADE' })
Student.belongsTo(School, { foreignKey: 'schoolId' })

School.hasMany(Teacher,   { foreignKey: 'schoolId', onDelete: 'CASCADE' })
Teacher.belongsTo(School, { foreignKey: 'schoolId' })
Teacher.belongsTo(User,   { foreignKey: 'userId', as: 'user' })
User.hasOne(Teacher,      { foreignKey: 'userId', as: 'teacherProfile' })

School.hasMany(Class,     { foreignKey: 'schoolId', onDelete: 'CASCADE' })
Class.belongsTo(School,   { foreignKey: 'schoolId' })
Class.belongsTo(Teacher,  { foreignKey: 'classTeacherId', as: 'classTeacher' })
Teacher.hasMany(Class,    { foreignKey: 'classTeacherId', as: 'assignedClasses' })

Student.belongsTo(Class,  { foreignKey: 'classId' })
Class.hasMany(Student,    { foreignKey: 'classId' })

School.hasMany(Attendance, { foreignKey: 'schoolId' })
Class.hasMany(Attendance,  { foreignKey: 'classId' })

School.hasMany(Fee,        { foreignKey: 'schoolId' })
Student.hasMany(Fee,       { foreignKey: 'studentId' })
Fee.belongsTo(Student,     { foreignKey: 'studentId' })

// Curriculum
School.hasMany(Chapter,    { foreignKey: 'schoolId', onDelete: 'CASCADE' })
Chapter.belongsTo(School,  { foreignKey: 'schoolId' })

// Assessments
School.hasMany(Assessment,      { foreignKey: 'schoolId', onDelete: 'CASCADE' })
Assessment.belongsTo(School,    { foreignKey: 'schoolId' })
Chapter.hasMany(Assessment,     { foreignKey: 'chapterId' })
Assessment.belongsTo(Chapter,   { foreignKey: 'chapterId' })
Assessment.hasMany(Mark,        { foreignKey: 'assessmentId', onDelete: 'CASCADE' })
Mark.belongsTo(Assessment,      { foreignKey: 'assessmentId' })
Student.hasMany(Mark,           { foreignKey: 'studentId' })
Mark.belongsTo(Student,         { foreignKey: 'studentId' })

// Behaviour
Student.hasMany(BehaviourLog,        { foreignKey: 'studentId', onDelete: 'CASCADE' })
BehaviourLog.belongsTo(Student,      { foreignKey: 'studentId' })
School.hasMany(BehaviourLog,         { foreignKey: 'schoolId' })
School.hasMany(BehaviourMetric,      { foreignKey: 'schoolId' })
BehaviourMetric.belongsTo(School,    { foreignKey: 'schoolId' })

// Notifications
User.hasMany(Notification,      { foreignKey: 'userId', onDelete: 'CASCADE' })
Notification.belongsTo(User,    { foreignKey: 'userId' })

// SchoolSettings associations
School.hasOne(SchoolSettings, { foreignKey: 'schoolId', as: 'settings', onDelete: 'CASCADE' })
SchoolSettings.belongsTo(School, { foreignKey: 'schoolId' })

// Notice associations
School.hasMany(Notice, { foreignKey: 'schoolId', onDelete: 'CASCADE' })
Notice.belongsTo(School, { foreignKey: 'schoolId' })
Notice.belongsTo(User, { foreignKey: 'createdBy', as: 'author' })

module.exports = {
  User, School, Student, Teacher, Class,
  Attendance, Fee, Chapter, Assessment, Mark,
  BehaviourLog, BehaviourMetric, Notification, ActivityLog,
  SchoolSettings, Notice,
}
