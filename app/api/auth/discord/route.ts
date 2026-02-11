import { NextResponse } from "next/server";
import fetch from "node-fetch";
import cookie from "cookie";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    const params = new URLSearchParams({
      client_id: process.env.CLIENT_ID!,
      redirect_uri: process.env.REDIRECT_URI!,
      response_type: "code",
      scope: "identify guilds guilds.join",
    });
    return NextResponse.redirect(
      `https://discord.com/api/oauth2/authorize?${params.toString()}`,
    );
  }

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.REDIRECT_URI!,
      }),
    });

    const tokenData = (await tokenRes.json()) as { access_token: string };
    if (!tokenData.access_token)
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const user = (await userRes.json()) as {
      mention: any;
      id: string;
      username: string;
      avatar?: string | null;
    };

    const guildId = process.env.GUILD_ID;
    const botToken = process.env.BOT_TOKEN;

    if (!guildId || !botToken) {
      console.error("Missing GUILD_ID or BOT_TOKEN environment variables");
      const response = NextResponse.redirect("http://localhost:3000/");
      response.headers.set(
        "Set-Cookie",
        cookie.serialize("discord_token", tokenData.access_token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          maxAge: 100 * 60 * 24,
          sameSite: "lax",
          path: "/",
        }),
      );
      return response;
    }

    const guildAddRes = await fetch(
      `https://discord.com/api/guilds/${guildId}/members/${user.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: tokenData.access_token,
        }),
      },
    );

    if (guildAddRes.status !== 204 && guildAddRes.status !== 200) {
      console.error("Failed to add user to guild:", await guildAddRes.text());
    }

    const dmChannelRes = await fetch(
      "https://discord.com/api/users/@me/channels",
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipient_id: user.id }),
      },
    );
    const dmChannelData = (await dmChannelRes.json()) as { id: string };

    if (!dmChannelData.id) {
      console.error("Failed to create DM channel:", dmChannelData);
    } else {
      const dmChannel = dmChannelData as { id: string };
      const messageRes = await fetch(
        `https://discord.com/api/channels/${dmChannel.id}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bot ${botToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            flags: 32768,
            components: [
              {
                type: 17,
                components: [
                  {
                    type: 10,
                    content: `Nice, you've successfully logged in! Welcome to RFL 90', <@${user.id}>!`,
                  },
                ],
              },
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    style: 5,
                    emoji: {
                      name: "icons8monitor50",
                      id: "1470488884503646349",
                    },
                    label: "Visit Website",
                    url: "http://localhost:3000/",
                  },
                  {
                    type: 2,
                    style: 5,
                    emoji: {
                      name: "discord",
                      id: "1470488643696328907",
                    },
                    label: "Join Discord",
                    url: "https://discord.gg/CBXuZahjGa",
                  },
                ],
              },
            ],
          }),
        },
      );
    }
    dmChannelRes.status !== 200 &&
      console.error("Failed to create DM channel:", await dmChannelRes.text());
    const response = NextResponse.redirect("http://localhost:3000/");
    response.headers.set(
      "Set-Cookie",
      cookie.serialize("discord_token", tokenData.access_token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        maxAge: 100 * 60 * 24,
        sameSite: "lax",
        path: "/",
      }),
    );

    return response;
  } catch (err) {
    console.error("OAuth Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
