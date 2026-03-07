type SendEmailParams = {
  to: string
  subject: string
  text?: string
  html?: string
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY
  const emailFrom = process.env.EMAIL_FROM || "notifications@coremodel.app"

  if (!apiKey) {
    console.log("--- Email (dev mode, no RESEND_API_KEY) ---")
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(text || html || "(no body)")
    console.log("--- End Email ---")
    return { success: true, dev: true }
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom,
      to,
      subject,
      text,
      html,
    }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error("Resend email send failed:", errorText)
    throw new Error(`Failed to send email: ${errorText}`)
  }

  return { success: true, dev: false }
}
