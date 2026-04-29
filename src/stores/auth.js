const USER_KEY = 'ticket-current-user'

export function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function login(username) {
  const trimmedName = username.trim()
  const user = {
    username: trimmedName,
    role: trimmedName === 'admin' ? 'admin' : 'user'
  }

  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

export function logout() {
  localStorage.removeItem(USER_KEY)
}
