// Formatting helpers: currency and dates across the portal.
export function money(n, cur = 'USD') {
  const symbols = { USD: '$', EUR: '€', GBP: '£', BDT: '৳', INR: '₹', AED: 'AED ' }
  const sym = symbols[cur] || '$'
  try {
    return sym + Number(n || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  } catch {
    return sym + Number(n || 0).toFixed(2)
  }
}

export function fmtDate(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export function timeAgo(d) {
  if (!d) return ''
  const secs = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return fmtDate(d)
}
