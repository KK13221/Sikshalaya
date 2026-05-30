import api from './client'

export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
}

export const schools = {
  list: (params) => api.get('/schools', { params }),
  get: (id) => api.get(`/schools/${id}`),
  create: (data) => api.post('/schools', data),
  update: (id, data) => api.put(`/schools/${id}`, data),
  remove: (id) => api.delete(`/schools/${id}`),
  stats: () => api.get('/schools/stats'),
}

export const students = {
  list: (params) => api.get('/students', { params }),
  get: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  remove: (id) => api.delete(`/students/${id}`),
  underperformers: (params) => api.get('/students/underperformers', { params }),
  metrics: (id) => api.get(`/students/${id}/metrics`),
  acknowledge: (id) => api.patch(`/students/${id}/acknowledge`),
}

export const teachers = {
  list: (params) => api.get('/teachers', { params }),
  get: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  remove: (id) => api.delete(`/teachers/${id}`),
  // mobile app teacher-scoped endpoints
  myClasses: () => api.get('/teachers/me/classes'),
  myStudents: (classId) => api.get(`/teachers/me/students`, { params: { classId } }),
  myAttendance: (params) => api.get('/teachers/me/attendance', { params }),
  markAttendance: (data) => api.post('/teachers/me/attendance', data),
  myAssessments: (params) => api.get('/teachers/me/assessments', { params }),
  myChapters: (params) => api.get('/teachers/me/chapters', { params }),
  enterMark: (assessmentId, studentId, data) => api.patch(`/teachers/me/assessments/${assessmentId}/marks/${studentId}`, data),
  myNotifications: () => api.get('/teachers/me/notifications'),
}

export const classes = {
  list: (params) => api.get('/classes', { params }),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
}

export const attendance = {
  list: (params) => api.get('/attendance', { params }),
  mark: (data) => api.post('/attendance', data),
  daily: (date, params) => api.get(`/attendance/daily/${date}`, { params }),
}

export const fees = {
  list: (params) => api.get('/fees', { params }),
  create: (data) => api.post('/fees', data),
  collect: (id, data) => api.put(`/fees/${id}/collect`, data),
  summary: (params) => api.get('/fees/summary', { params }),
}

export const users = {
  list: (params) => api.get('/users', { params }),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  remove: (id) => api.delete(`/users/${id}`),
}

export const dashboard = {
  superAdmin: () => api.get('/dashboard/superadmin'),
  principal: (params) => api.get('/dashboard/principal', { params }),
}

export const chapters = {
  list: (params) => api.get('/chapters', { params }),
  create: (data) => api.post('/chapters', data),
  update: (id, data) => api.patch(`/chapters/${id}`, data),
  remove: (id) => api.delete(`/chapters/${id}`),
}

export const assessments = {
  list: (params) => api.get('/assessments', { params }),
  create: (data) => api.post('/assessments', data),
  getMarks: (id) => api.get(`/assessments/${id}/marks`),
  upsertMark: (id, studentId, data) => api.patch(`/assessments/${id}/marks/${studentId}`, data),
  submit: (id) => api.post(`/assessments/${id}/submit`),
  publish: (data) => api.post('/assessments/publish', data),
}

export const behaviour = {
  presets: () => api.get('/behaviour/presets'),
  logs: (params) => api.get('/behaviour/logs', { params }),
  create: (data) => api.post('/behaviour/logs', data),
}

export const behaviourMetrics = {
  list: (params) => api.get('/behaviour-metrics', { params }),
  create: (data) => api.post('/behaviour-metrics', data),
  remove: (id) => api.delete(`/behaviour-metrics/${id}`),
}

export const notifications = {
  list: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
}

export const notices = {
  list: (params) => api.get('/notices', { params }),
  create: (data) => api.post('/notices', data),
  remove: (id) => api.delete(`/notices/${id}`),
}

export const settings = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
}
