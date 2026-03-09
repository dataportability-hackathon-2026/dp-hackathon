import { AccessToken } from "livekit-server-sdk";
import { type NextRequest, NextResponse } from "next/server";

// Force Node.js runtime (livekit-server-sdk uses Node crypto)
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL;

  console.log("[livekit-token] POST request received");
  console.log("[livekit-token] env check:", {
    hasApiKey: !!apiKey,
    hasApiSecret: !!apiSecret,
    hasWsUrl: !!wsUrl,
    wsUrl: wsUrl ? `${wsUrl.slice(0, 20)}...` : "MISSING",
  });

  if (!apiKey || !apiSecret || !wsUrl) {
    console.error("[livekit-token] Missing env vars:", {
      LIVEKIT_API_KEY: apiKey ? "set" : "MISSING",
      LIVEKIT_API_SECRET: apiSecret ? "set" : "MISSING",
      LIVEKIT_URL: wsUrl ? "set" : "MISSING",
    });
    return NextResponse.json(
      { error: "LiveKit environment variables not configured" },
      { status: 500 },
    );
  }

  // Parse optional roomName from body so clients can rejoin the same room
  let roomName = `learning-room-${crypto.randomUUID()}`;
  try {
    const body = await request.json();
    if (typeof body.roomName === "string" && body.roomName.length > 0) {
      roomName = body.roomName;
    }
  } catch {
    // No body or invalid JSON — use generated roomName
  }

  const participantIdentity = `user-${crypto.randomUUID()}`;

  console.log("[livekit-token] Creating token:", {
    roomName,
    participantIdentity,
    ttl: "10m",
  });

  try {
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      ttl: "10m",
    });
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    console.log(
      "[livekit-token] Token created successfully, length:",
      token.length,
    );
    return NextResponse.json({ token, wsUrl, roomName });
  } catch (err) {
    console.error("[livekit-token] Token creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create LiveKit token", details: String(err) },
      { status: 500 },
    );
  }
}
