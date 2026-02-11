import { NextResponse } from "next/server";
import cookie from "cookie";

export async function GET(req: Request) {
  const cookies = cookie.parse(req.headers.get("cookie") || "");
  const token = cookies.discord_token;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userRes.ok) {
      return NextResponse.json({ authenticated: false });
    }

    const user = await userRes.json();
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        discriminator: user.discriminator,
      },
    });
  } catch (err) {
    console.error("Auth check error:", err);
    return NextResponse.json({ authenticated: false });
  }
}
