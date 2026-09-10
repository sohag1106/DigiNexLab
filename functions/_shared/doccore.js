// Cloudflare Pages Functions — shared helpers for quotations & invoices.
// `query` is the shared db.query bound to the function env.

export function normalizeItems(items) {
  if (!Array.isArray(items)) return []
  return items
    .map((i) => ({
      description: String(i.description || '').trim() || 'Item',
      qty: Number(i.qty || 1),
      rate: Number(i.rate || 0),
    }))
    .filter((i) => i.description)
}

export function computeTotals(items, discount = 0, tax = 0) {
  const subtotal = items.reduce((s, i) => s + Number(i.rate || 0) * Number(i.qty || 0), 0)
  const afterDiscount = subtotal - Number(discount || 0)
  const taxAmt = (afterDiscount * Number(tax || 0)) / 100
  const total = afterDiscount + taxAmt
  return { subtotal, discount: Number(discount || 0), taxAmt, total }
}

// Deterministically build the next document number for a table.
export async function nextNumber(env, query, prefix, table) {
  try {
    const rows = await query(env, `SELECT count(*)::int AS n FROM ${table}`)
    const n = (rows[0] && rows[0].n) || 0
    return `${prefix}-${String(n + 1).padStart(4, '0')}`
  } catch {
    return `${prefix}-${String(Date.now()).slice(-6)}`
  }
}
