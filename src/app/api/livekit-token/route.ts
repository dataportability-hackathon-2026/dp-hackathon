import { type NextRequest, NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"

// Force Node.js runtime (livekit-server-sdk uses Node crypto)
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const wsUrl = process.env.LIVEKIT_URL

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      { error: "LiveKit environment variables not configured" },
      { status: 500 }
    )
  }

  // Parse optional roomName from body so clients can rejoin the same room
  let roomName = `learning-room-${crypto.randomUUID()}`
  try {
    const body = await request.json()
    if (typeof body.roomName === "string" && body.roomName.length > 0) {
      roomName = body.roomName
    }
  } catch {
    // No body or invalid JSON — use generated roomName
  }

  const participantIdentity = `user-${crypto.randomUUID()}`

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantIdentity,
    ttl: "10m",
  })
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  })

  const token = await at.toJwt()

  return NextResponse.json({ token, wsUrl, roomName })
}
