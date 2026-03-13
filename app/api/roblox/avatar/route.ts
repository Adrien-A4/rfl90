import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 },
      );
    }
    const userRes = await fetch(`https://users.roblox.com/v1/usernames/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: true }),
    });

    if (!userRes.ok) {
      if (userRes.status === 429) {
        return NextResponse.json(
          { error: "Rate limited by Roblox" },
          { status: 429 },
        );
      }
      throw new Error("Failed to fetch Roblox user");
    }

    const userData = await userRes.json();
    if (!userData.data || userData.data.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userData.data[0].id;
    const thumbRes = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`,
    );

    if (!thumbRes.ok) {
      throw new Error("Failed to fetch Roblox thumbnail");
    }

    const thumbData = await thumbRes.json();
    if (!thumbData.data || thumbData.data.length === 0) {
      return NextResponse.json(
        { error: "Thumbnail not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      userId,
      imageUrl: thumbData.data[0].imageUrl,
    });
  } catch (err) {
    console.error("Roblox API Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
