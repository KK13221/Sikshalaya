require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const { sequelize } = require('../config/db')
const { User, School, Student, Teacher, Class, Fee, Attendance, Chapter } = require('../models')

// ── Data pools ────────────────────────────────────────────────────────────
const maleFirstNames   = ['Aarav','Arjun','Dev','Karthik','Rohan','Vikram','Rahul','Amit','Suresh','Dinesh','Nikhil','Sanjay','Rajesh','Tarun','Manish','Aditya','Gaurav','Deepak','Vivek','Ajay']
const femaleFirstNames = ['Priya','Anjali','Sneha','Riya','Pooja','Nisha','Kavitha','Ananya','Padma','Sunita','Meena','Rekha','Swati','Divya','Preeti','Lakshmi','Geeta','Mamta','Asha','Rani']
const lastNames        = ['Sharma','Mehta','Iyer','Singh','Gupta','Patel','Nair','Kumar','Reddy','Joshi','Rao','Das','Verma','Mishra','Pandey','Tiwari','Dubey','Srivastava','Agarwal','Bose']

const rand     = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randInt  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const maleName = () => `${rand(maleFirstNames)} ${rand(lastNames)}`
const femName  = () => `${rand(femaleFirstNames)} ${rand(lastNames)}`
const randName = (gender) => gender === 'male' ? maleName() : femName()
const bloodGroups = ['A+','A-','B+','B-','O+','O-','AB+','AB-']
const relations   = ['Father','Mother','Guardian']

const schoolDefs = [
  { name: 'Delhi Public School Sector 45',   city: 'Gurugram',  state: 'Haryana',       board: 'CBSE',        plan: 'Enterprise', status: 'active',  pincode: '122003', phone: '0124-4567890', established: 1998 },
  { name: 'Ryan International School',        city: 'Bengaluru', state: 'Karnataka',     board: 'ICSE',        plan: 'Enterprise', status: 'active',  pincode: '560001', phone: '080-23456789', established: 2002 },
  { name: 'Kendriya Vidyalaya No 2',          city: 'Pune',      state: 'Maharashtra',   board: 'CBSE',        plan: 'Pro',        status: 'active',  pincode: '411001', phone: '020-34567890', established: 1985 },
  { name: "St Xavier's High School",          city: 'Kolkata',   state: 'West Bengal',   board: 'ICSE',        plan: 'Pro',        status: 'active',  pincode: '700001', phone: '033-23456789', established: 1978 },
  { name: 'Sunshine Academy',                 city: 'Jaipur',    state: 'Rajasthan',     board: 'State Board', plan: 'Basic',      status: 'trial',   pincode: '302001', phone: '0141-5678901', established: 2015 },
  { name: 'Heritage International School',    city: 'Mumbai',    state: 'Maharashtra',   board: 'IB',          plan: 'Enterprise', status: 'active',  pincode: '400001', phone: '022-23456789', established: 2005 },
]

const teacherPool = [
  { name: 'Mrs. Kavitha Ramachandran', subjects: ['Mathematics'],       qualification: 'M.Sc. Mathematics',    experience: 12 },
  { name: 'Mr. Suresh Yadav',          subjects: ['Science','Physics'], qualification: 'M.Sc. Physics',         experience: 9  },
  { name: 'Ms. Ananya Das',            subjects: ['English'],           qualification: 'M.A. English Literature',experience: 7 },
  { name: 'Mr. Dinesh Kumar',          subjects: ['Social Studies'],    qualification: 'M.A. History',          experience: 11 },
  { name: 'Mrs. Padma Srinivas',       subjects: ['Hindi'],             qualification: 'M.A. Hindi',            experience: 15 },
  { name: 'Mr. Arjun Nair',            subjects: ['Physical Education'],qualification: 'B.P.Ed',                experience: 6  },
  { name: 'Ms. Preethi Menon',         subjects: ['Chemistry','Biology'],qualification: 'M.Sc. Chemistry',      experience: 8  },
  { name: 'Mr. Rahul Verma',           subjects: ['Computer Science'],  qualification: 'M.Tech CSE',            experience: 5  },
  { name: 'Mrs. Sunita Joshi',         subjects: ['Geography'],         qualification: 'M.A. Geography',        experience: 10 },
  { name: 'Mr. Tarun Mishra',          subjects: ['Economics'],         qualification: 'M.A. Economics',        experience: 13 },
]

const subjectsByClass = {
  primary:    ['Mathematics','English','Hindi','Environmental Science','Art & Craft','Physical Education'],
  middle:     ['Mathematics','Science','English','Hindi','Social Studies','Computer Science','Physical Education'],
  secondary:  ['Mathematics','Physics','Chemistry','Biology','English','Hindi','History','Geography','Computer Science'],
}

const chapters = {
  'Mathematics':        ['Number System','Polynomials','Coordinate Geometry','Linear Equations','Triangles','Statistics'],
  'Science':            ['Matter','Force & Laws of Motion','Gravitation','Motion','Work & Energy','Sound'],
  'English':            ['The Fun They Had','The Sound of Music','The Little Girl','A Truly Beautiful Mind','The Snake and the Mirror'],
  'Social Studies':     ['The French Revolution','Socialism in Europe','Nazism','Forest Society','Pastoralists in Modern World'],
  'Computer Science':   ['Introduction to Computers','MS Office','Networking','Internet Basics','Programming Concepts'],
  'Physics':            ['Electric Charges','Current Electricity','Magnetic Effects','Electromagnetic Induction','Optics'],
  'Chemistry':          ['Chemical Reactions','Acids Bases Salts','Metals & Non-Metals','Carbon Compounds','Periodic Table'],
}

async function seed() {
  await sequelize.authenticate()
  console.log('Connected to MySQL\n')

  // ── Super Admin ──────────────────────────────────────────────────────────
  const superAdmin = await User.create({
    name: 'Rajesh Kumar', email: 'admin@shikshalaya.in',
    password: 'Admin@123', role: 'superadmin',
    phone: '+91 98765 43210',
  })
  console.log('✓ Super Admin created')
  console.log('  Email:    admin@shikshalaya.in')
  console.log('  Password: Admin@123\n')

  for (const def of schoolDefs) {
    const school = await School.create({
      name:         def.name,
      city:         def.city,
      state:        def.state,
      board:        def.board,
      plan:         def.plan,
      status:       def.status,
      pincode:      def.pincode,
      phone:        def.phone,
      established:  def.established,
      addressLine1: `${randInt(1,99)} School Marg, ${def.city}`,
      email:        `info@${def.city.toLowerCase().replace(/\s/g,'')}branch.edu.in`,
      website:      `https://www.${def.name.toLowerCase().replace(/[^a-z]/g,'').slice(0,12)}.edu.in`,
      trialEndsAt:  def.status === 'trial' ? new Date(Date.now() + 30*24*60*60*1000) : null,
    })

    // ── Principal ──────────────────────────────────────────────────────────
    const principalEmail = `principal.${def.city.toLowerCase().replace(/\s/g,'')}@shikshalaya.in`
    const principal = await User.create({
      name: `Dr. ${maleName()}`, email: principalEmail,
      password: 'Principal@123', role: 'principal',
      schoolId: school.id, phone: `+91 ${randInt(70000,99999)} ${randInt(10000,99999)}`,
    })
    await school.update({ principalId: principal.id })

    // ── Classes ────────────────────────────────────────────────────────────
    const classRecords = []
    for (let c = 1; c <= 10; c++) {
      const sections = c <= 5 ? ['A','B','C'] : ['A','B']
      const subjectKey = c <= 5 ? 'primary' : c <= 8 ? 'middle' : 'secondary'
      for (const sec of sections) {
        classRecords.push({
          schoolId: school.id,
          name: `Class ${c}`,
          section: sec,
          subjects: subjectsByClass[subjectKey],
          academicYear: '2025-26',
        })
      }
    }
    const classes = await Class.bulkCreate(classRecords)

    // ── Teachers ───────────────────────────────────────────────────────────
    const teachers = []
    for (let i = 0; i < teacherPool.length; i++) {
      const t = teacherPool[i]
      const email = `teacher.${def.city.toLowerCase().replace(/\s/g,'')}${i+1}@shikshalaya.in`
      const user = await User.create({
        name: t.name, email, password: 'Teacher@123', role: 'teacher', schoolId: school.id
      })
      const teacher = await Teacher.create({
        schoolId:      school.id,
        employeeId:    `${def.city.slice(0,3).toUpperCase()}EMP${String(i+1).padStart(3,'0')}`,
        name:          t.name,
        subjects:      t.subjects,
        experience:    t.experience,
        qualification: t.qualification,
        isActive:      true,
        email,
        userId:        user.id
      })
      teachers.push(teacher)
    }

    // ── Students + Fees + Attendance ───────────────────────────────────────
    const allStudents = []
    const allFees     = []

    for (const cls of classes) {
      const classNum = parseInt(cls.name.replace('Class ', ''))
      const studentsPerClass = randInt(18, 28)

      for (let j = 0; j < studentsPerClass; j++) {
        const gender = j % 2 === 0 ? 'male' : 'female'
        const dob = new Date(2012 - classNum, randInt(0,11), randInt(1,28))
        allStudents.push({
          schoolId:         school.id,
          classId:          cls.id,
          section:          cls.section,
          rollNo:           j + 1,
          admissionNo:      `${def.city.slice(0,3).toUpperCase()}/${new Date().getFullYear()}/${String(allStudents.length + 1).padStart(4,'0')}`,
          name:             randName(gender),
          gender,
          dateOfBirth:      dob.toISOString().slice(0,10),
          guardianName:     randName('male'),
          guardianRelation: rand(relations),
          guardianPhone:    `+91 ${randInt(70000,99999)} ${randInt(10000,99999)}`,
          guardianEmail:    `parent${allStudents.length+1}@gmail.com`,
          city:             def.city,
          state:            def.state,
          pincode:          def.pincode,
          bloodGroup:       rand(bloodGroups),
          isActive:         true,
          admissionDate:    `${2020 + Math.min(classNum - 1, 4)}-04-01`,
        })
      }
    }

    const inserted = await Student.bulkCreate(allStudents, { returning: true })

    // Fees — Term 1 & Term 2 per student
    const feeItems1 = [{ label: 'Tuition Fee', amount: 8000 }, { label: 'Development Fee', amount: 1500 }, { label: 'Sports Fee', amount: 500 }]
    const feeItems2 = [{ label: 'Tuition Fee', amount: 8000 }, { label: 'Exam Fee', amount: 1200 }, { label: 'Library Fee', amount: 300 }]

    inserted.forEach((s, i) => {
      const paid1 = i % 4 !== 0  // 75% paid term 1
      const paid2 = i % 6 === 0  // ~17% paid term 2
      allFees.push({
        schoolId: school.id, studentId: s.id,
        term: 'Term 1 2025-26', dueDate: '2025-05-31',
        items: feeItems1, totalAmount: 10000,
        paidAmount: paid1 ? 10000 : 0,
        status: paid1 ? 'paid' : 'overdue',
      })
      allFees.push({
        schoolId: school.id, studentId: s.id,
        term: 'Term 2 2025-26', dueDate: '2025-10-31',
        items: feeItems2, totalAmount: 9500,
        paidAmount: paid2 ? 9500 : 0,
        status: paid2 ? 'paid' : 'pending',
      })
    })
    await Fee.bulkCreate(allFees.splice(0))

    // Attendance — last 15 school days
    const attendanceRecords = []
    const today = new Date()
    for (let d = 14; d >= 0; d--) {
      const date = new Date(today)
      date.setDate(today.getDate() - d)
      if (date.getDay() === 0 || date.getDay() === 6) continue // skip weekends
      const dateStr = date.toISOString().slice(0,10)
      inserted.forEach(s => {
        attendanceRecords.push({
          schoolId:  school.id,
          studentId: s.id,
          date:      dateStr,
          status:    Math.random() < 0.92 ? 'present' : (Math.random() < 0.5 ? 'absent' : 'late'),
        })
      })
    }
    if (attendanceRecords.length) {
      await Attendance.bulkCreate(attendanceRecords, { ignoreDuplicates: true })
    }

    // Chapters for key subjects
    const chapterRecords = []
    for (const [subject, chapterList] of Object.entries(chapters)) {
      chapterList.forEach((title, idx) => {
        chapterRecords.push({
          schoolId:    school.id,
          subject,
          title,
          classGroup:  subject === 'Physics' || subject === 'Chemistry' ? 'Class 11' : 'Class 9',
          orderIndex:  idx + 1,
          status:      idx < 3 ? 'completed' : idx === 3 ? 'ongoing' : 'pending',
          academicYear: '2025-26',
        })
      })
    }
    await Chapter.bulkCreate(chapterRecords, { ignoreDuplicates: true })

    console.log(`✓ ${school.name}  [${def.plan} / ${def.status}]`)
    console.log(`  Principal: ${principalEmail} / Principal@123`)
    console.log(`  Classes: ${classes.length}  |  Teachers: ${teachers.length}  |  Students: ${inserted.length}`)
  }

  console.log('\n════════════════════════════════════════')
  console.log('✅  Seed complete!')
  console.log('════════════════════════════════════════')
  console.log('Super Admin →  admin@shikshalaya.in  /  Admin@123')
  console.log('Principals  →  principal.<city>@shikshalaya.in  /  Principal@123')
  console.log('  Cities: gurugram, bengaluru, pune, kolkata, jaipur, mumbai')
  process.exit(0)
}

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1) })
