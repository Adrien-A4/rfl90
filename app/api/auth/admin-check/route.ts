import { NextResponse } from "next/server";
import cookie from "cookie";

const GUILD_ID = process.env.GUILD_ID;

const PERMISSIONS = {
  ADMINISTRATOR: 0x8,
};

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

    let isAdmin = false;

    if (GUILD_ID) {
      try {
        const guildRes = await fetch(
          `https://discord.com/api/guilds/${GUILD_ID}`,
          {
            headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` },
          },
        );

        if (guildRes.ok) {
          const guild = await guildRes.json();

          if (guild.owner_id === user.id) {
            isAdmin = true;
          } else {
            const guildMemberRes = await fetch(
              `https://discord.com/api/guilds/${GUILD_ID}/members/${user.id}`,
              {
                headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` },
              },
            );

            if (guildMemberRes.ok) {
              const guildMember = await guildMemberRes.json();
              const permissions = BigInt(guildMember.permissions || 0);
              isAdmin =
                (permissions & BigInt(PERMISSIONS.ADMINISTRATOR)) !== BigInt(0);
            }
          }
        }
      } catch (guildErr) {
        console.error("Guild check error:", guildErr);
      }
    }

    return NextResponse.json({
      authenticated: true,
      isAdmin,
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
