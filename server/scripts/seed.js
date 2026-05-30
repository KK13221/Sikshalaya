require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const { sequelize } = require('../config/db')
const { User, School, Student, Teacher, Class, Fee } = require('../models')

const schoolDefs = [
  { name: 'Delhi Public School, Sector 45', city: 'Gurugram', state: 'Haryana', plan: 'Enterprise', status: 'active' },
  { name: 'Ryan International School', city: 'Bangalore', state: 'Karnataka', plan: 'Enterprise', status: 'active' },
  { name: 'Kendriya Vidyalaya No. 2', city: 'Pune', state: 'Maharashtra', plan: 'Pro', status: 'active' },
  { name: "St. Xavier's High School", city: 'Kolkata', state: 'West Bengal', plan: 'Pro', status: 'active' },
  { name: 'Sunshine Academy', city: 'Jaipur', state: 'Rajasthan', plan: 'Basic', status: 'trial' },
]

const firstNames = ['Aarav', 'Priya', 'Karthik', 'Anjali', 'Rohan', 'Sneha', 'Dev', 'Riya', 'Arjun', 'Pooja', 'Vikram', 'Nisha']
const lastNames = ['Sharma', 'Mehta', 'Iyer', 'Singh', 'Gupta', 'Patel', 'Nair', 'Kumar', 'Reddy', 'Joshi', 'Rao', 'Das']
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randName = () => `${rand(firstNames)} ${rand(lastNames)}`

async function seed() {
  await sequelize.authenticate()
  console.log('Connected to MySQL')

  // Sync tables (recreate)
  await sequelize.sync({ force: true })
  console.log('Tables recreated')

  // Super admin
  await User.create({ name: 'Rajesh Kumar', email: 'admin@shikshalaya.in', password: 'Admin@123', role: 'superadmin' })
  console.log('Super admin created: admin@shikshalaya.in / Admin@123')

  for (const def of schoolDefs) {
    const school = await School.create({
      name: def.name, city: def.city, state: def.state,
      addressLine1: '123 School Road',
      board: 'CBSE', plan: def.plan, status: def.status,
      email: `info@${def.city.toLowerCase()}.edu.in`,
    })

    const principal = await User.create({
      name: `Dr. Principal ${def.city}`,
      email: `principal.${def.city.toLowerCase()}@shikshalaya.in`,
      password: 'Principal@123', role: 'principal', schoolId: school.id,
    })
    await school.update({ principalId: principal.id })

    // Classes
    const classRecords = []
    for (let c = 1; c <= 8; c++) {
      for (const sec of ['A', 'B', 'C']) {
        classRecords.push({ schoolId: school.id, name: `Class ${c}`, section: sec, subjects: ['Maths', 'Science', 'English', 'Hindi', 'SST'] })
      }
    }
    const classes = await Class.bulkCreate(classRecords)

    // Teachers
    const teacherDefs = [
      ['Mrs. Kavitha R.', 'Mathematics'], ['Mr. Suresh Yadav', 'Science'],
      ['Ms. Ananya Das', 'English'], ['Mr. Dinesh Kumar', 'Social Studies'],
      ['Mrs. Padma Srinivas', 'Hindi'], ['Mr. Arjun Nair', 'Physical Ed.'],
    ]
    for (let i = 0; i < teacherDefs.length; i++) {
      const [name, subject] = teacherDefs[i]
      const email = `teacher.local${i + 1}@shikshalaya.in`
      const user = await User.create({
        name, email, password: 'Teacher@123', role: 'teacher', schoolId: school.id
      })
      await Teacher.create({
        schoolId: school.id, employeeId: `EMP${String(i + 1).padStart(3, '0')}`,
        name, subjects: [subject], experience: 5 + i * 2, qualification: 'M.Ed.',
        email, userId: user.id
      })
    }

    // Students + Fees
    const students = []
    classes.forEach((cls, ci) => {
      for (let j = 0; j < 10; j++) {
        students.push({
          schoolId: school.id,
          admissionNo: `${def.city.slice(0, 3).toUpperCase()}/${new Date().getFullYear()}/${String(ci * 10 + j + 1).padStart(4, '0')}`,
          name: randName(), classId: cls.id, section: cls.section, rollNo: j + 1,
          gender: j % 2 === 0 ? 'male' : 'female',
          guardianName: randName(), guardianRelation: 'Parent',
          guardianPhone: `+91 9${Math.floor(1e9 + Math.random() * 9e9)}`,
          city: def.city, state: def.state,
        })
      }
    })
    const inserted = await Student.bulkCreate(students, { returning: true })

    const feeItems = [{ label: 'Tuition Fee', amount: 8000 }, { label: 'Dev Fee', amount: 1500 }, { label: 'Sports Fee', amount: 500 }]
    const fees = inserted.map((s, i) => ({
      schoolId: school.id, studentId: s.id,
      term: 'Term 1 2025-26',
      dueDate: '2025-05-31',
      items: feeItems, totalAmount: 10000,
      paidAmount: i % 3 !== 0 ? 10000 : 0,
      status: i % 3 !== 0 ? 'paid' : 'pending',
    }))
    await Fee.bulkCreate(fees)

    console.log(`✓ Seeded: ${school.name} (principal: principal.${def.city.toLowerCase()}@shikshalaya.in / Principal@123)`)
  }

  console.log('\n✅ Seed complete!')
  console.log('Super Admin:  admin@shikshalaya.in / Admin@123')
  console.log('Principal:    principal.gurugram@shikshalaya.in / Principal@123')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
