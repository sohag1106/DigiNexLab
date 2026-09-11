// Branded email templates shared across transactional sends.

// Escapes a value for safe interpolation into HTML.
function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const BRAND = {
  name: 'BrightSkyIT',
  tagline: 'Creative Digital Agency',
  magenta: '#e0277a',
  dark: '#14102a',
  muted: '#6b7280',
  light: '#f6f7fb',
}

// Outer shell every email wraps; keeps inline styles for maximum client support.
function shell(bodyHtml) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background-color:#eef0f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef0f5;width:100%;">
      <tr><td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e4e7ee;box-shadow:0 8px 28px rgba(20,16,42,.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND.dark};padding:26px 34px;border-bottom:4px solid ${BRAND.magenta};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:.3px;">
                    BrightSky<em style="font-style:normal;color:${BRAND.magenta};">IT</em>
                  </td>
                  <td align="right" style="color:#a9adc4;font-size:12px;letter-spacing:.06em;">
                    ${BRAND.tagline}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr><td style="padding:34px 34px 8px 34px;">${bodyHtml}</td></tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 34px 30px 34px;border-top:1px solid #eef0f5;background-color:${BRAND.light};">
              <p style="margin:0 0 8px 0;color:${BRAND.muted};font-size:13px;line-height:1.6;">
                <strong style="color:#374151;">${BRAND.name}</strong> · ${BRAND.tagline}<br />
                hello@brightskyit.com · brightskyit.com<br />
                Phone/WhatsApp: +880 1410-217430
              </p>
              <p style="margin:0;color:#9aa0b3;font-size:12px;line-height:1.6;">
                Mohanogor Project, Rampura, Dhaka, Bangladesh · Oman Branch — Muscat, Sultanate of Oman
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0 0;color:#9aa0b3;font-size:12px;">
          You received this email because an account was created for you on the BrightSkyIT portal.
        </p>
      </td></tr>
    </table>
  </body>
</html>`
}

// Membership invitation — the "appointment" carries the member's role/designation.
export function invitationTemplate({ name, email, otp, designation, link }) {
  const safeName = esc(name || 'there')
  const body = `
      <p style="margin:0 0 6px 0;font-size:13px;color:${BRAND.muted};letter-spacing:.08em;text-transform:uppercase;">Appointment</p>
      <h1 style="margin:0 0 6px 0;font-size:24px;color:${BRAND.dark};line-height:1.25;font-weight:700;">
        Welcome to BrightSkyIT, ${safeName}!
      </h1>
      <p style="margin:0 0 22px 0;font-size:15px;color:#4b5563;line-height:1.6;">
        Your <strong>${esc(designation || 'Team Member')}</strong> account has been created on the
        BrightSkyIT portal. Sign in below to get started — you’ll set your own password the first time.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="background-color:${BRAND.light};border:1px solid #e4e7ee;border-radius:10px;">
        <tr>
          <td style="padding:18px 22px;">
            <p style="margin:0 0 3px 0;font-size:12px;color:${BRAND.muted};">APPOINTMENT</p>
            <p style="margin:0 0 16px 0;font-size:16px;color:${BRAND.dark};font-weight:600;">${esc(designation || 'Team Member')}</p>
            <p style="margin:0 0 3px 0;font-size:12px;color:${BRAND.muted};">LOGIN EMAIL</p>
            <p style="margin:0 0 16px 0;font-size:15px;color:#111827;">${esc(email)}</p>
            <p style="margin:0 0 3px 0;font-size:12px;color:${BRAND.muted};">ONE-TIME PASSWORD</p>
            <p style="margin:0;font-size:15px;color:${BRAND.magenta};font-weight:700;letter-spacing:2px;">${esc(otp)}</p>
          </td>
        </tr>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 8px 0;">
        <tr>
          <td align="center" style="border-radius:8px;background-color:${BRAND.magenta};">
            <a href="${esc(link)}" target="_blank"
               style="display:inline-block;padding:14px 34px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
              Open the Portal →
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:18px 0 0 0;font-size:13px;color:${BRAND.muted};line-height:1.6;">
        You can also copy this link into your browser: ${esc(link)}
      </p>
      <p style="margin:18px 0 0 0;font-size:13px;color:${BRAND.muted};line-height:1.6;">
        If you have any trouble signing in, just reply to this email and we’ll help you out.
      </p>`
  return shell(body)
}
