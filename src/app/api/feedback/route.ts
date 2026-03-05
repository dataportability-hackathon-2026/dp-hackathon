import { z } from "zod"

const feedbackSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  category: z.enum(["bug", "feature", "general"]),
  message: z.string().min(1),
})

const SUPPORT_EMAIL = "matt@mattwood.co"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = feedbackSchema.safeParse(body)

    if (!result.success) {
      return Response.json(
        { error: "Invalid feedback data" },
        { status: 400 }
      )
    }

    const { name, email, category, message } = result.data

    const subject = `[Feedback - ${category}] from ${name}`
    const text = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Category: ${category}`,
      ``,
      `Message:`,
      message,
    ].join("\n")

    // Send via Resend, SendGrid, or any SMTP provider by setting EMAIL_API_KEY
    // For now, uses a simple fetch to a mailto-compatible endpoint
    const apiKey = process.env.EMAIL_API_KEY
    const emailFrom = process.env.EMAIL_FROM || "feedback@coremodel.app"

    if (apiKey) {
      // Example: Resend integration
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: emailFrom,
          to: SUPPORT_EMAIL,
          reply_to: email,
          subject,
          text,
        }),
      })

      if (!res.ok) {
        console.error("Email send failed:", await res.text())
        return Response.json(
          { error: "Failed to send feedback" },
          { status: 500 }
        )
      }
    } else {
      // Fallback: log to console when no email provider is configured
      console.log("--- Feedback Received ---")
      console.log(`To: ${SUPPORT_EMAIL}`)
      console.log(`Subject: ${subject}`)
      console.log(text)
      console.log("--- End Feedback ---")
    }

    return Response.json({ success: true })
  } catch {
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
