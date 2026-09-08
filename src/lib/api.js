// Lightweight fetch wrapper around Netlify Functions.
// Sends JSON, attaches Bearer token from storage, and normalizes errors.

const BASE = '/.netlify/functions'

export function getToken() {
  try {
    return sessionStorage.getItem('bs_token')
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) sessionStorage.setItem('bs_token', token)
    else sessionStorage.removeItem('bs_token')
  } catch {}
}

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // Handle PDF/data responses
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/pdf')) {
    const buf = await res.arrayBuffer()
    if (!res.ok) throw new Error('Download failed.')
    return { _pdf: buf, _name: filenameFrom(res) }
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) {
    const msg = (data && data.error) || `Request failed (${res.status})`
    const err = new Error(msg)
    err.status = res.status
    throw err
  }
  return data
}

function filenameFrom(res) {
  const cd = res.headers.get('content-disposition') || ''
  const m = cd.match(/filename="?([^";]+)"?/)
  return m ? m[1] : 'document.pdf'
}

export async function downloadPdf(pathname) {
  const { _pdf, _name } = await api(pathname)
  const url = URL.createObjectURL(new Blob([_pdf], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = _name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}
