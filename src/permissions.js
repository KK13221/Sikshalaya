const STORAGE_KEY = 'shikshalaya_permissions'

const DEFAULT_PERMS = [
  { label: 'Create / delete branches',    superadmin: true,  principal: false, teacher: false },
  { label: 'Invite principals',           superadmin: true,  principal: false, teacher: false },
  { label: 'Invite teachers',             superadmin: true,  principal: true,  teacher: false },
  { label: 'View all branch data',        superadmin: true,  principal: false, teacher: false },
  { label: 'Manage classes & sections',   superadmin: true,  principal: true,  teacher: false },
  { label: 'Enter marks',                 superadmin: true,  principal: true,  teacher: true  },
  { label: 'Mark attendance',             superadmin: true,  principal: true,  teacher: true  },
  { label: 'Export data',                 superadmin: true,  principal: true,  teacher: false },
  { label: 'Publish term results',        superadmin: true,  principal: true,  teacher: false },
  { label: 'View audit logs',             superadmin: true,  principal: true,  teacher: false },
]

export function getPermissions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_PERMS
  } catch {
    return DEFAULT_PERMS
  }
}

export function hasPermission(label, role) {
  if (role === 'superadmin') return true
  const perms = getPermissions()
  const entry = perms.find(p => p.label === label)
  if (!entry) return true // unknown permission → allow by default
  return entry[role] === true
}
