import { NextResponse } from "next/server";
import cookie from "cookie";

const GUILD_ID = process.env.GUILD_ID;

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
            const memberRes = await fetch(
              `https://discord.com/api/guilds/${GUILD_ID}/members/${user.id}`,
              {
                headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` },
              },
            );

            if (memberRes.ok) {
              const member = await memberRes.json();

              const rolesRes = await fetch(
                `https://discord.com/api/guilds/${GUILD_ID}/roles`,
                {
                  headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` },
                },
              );

              if (rolesRes.ok) {
                const roles = await rolesRes.json();
                const maintainerRole = roles.find(
                  (r: any) => r.name === "Maintainer",
                );

                if (
                  maintainerRole &&
                  member.roles.includes(maintainerRole.id)
                ) {
                  isAdmin = true;
                }
              }
            }
          }
        }
      } catch (e) {
        console.error("Guild check error:", e);
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
