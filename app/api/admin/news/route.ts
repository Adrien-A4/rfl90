import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get("published") === "true";

    const supabase = getServerSupabase();
    let query = supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    if (publishedOnly) {
      query = query.eq("is_published", true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ news: data });
  } catch (err) {
    console.error("Error fetching news:", err);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      content,
      image_url,
      author,
      category,
      is_published,
      published_at,
    } = body;

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("news")
      .insert({
        title,
        content,
        image_url: image_url || null,
        author: author || "Admin",
        category: category || "General",
        is_published: is_published ?? false,
        published_at: published_at || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ news: data }, { status: 201 });
  } catch (err) {
    console.error("Error creating news:", err);
    return NextResponse.json(
      { error: "Failed to create news" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "News ID is required" },
        { status: 400 },
      );
    }

    const updates = {
      title: data.title,
      content: data.content,
      image_url: data.image_url,
      author: data.author,
      category: data.category,
      is_published: data.is_published,
      published_at: data.published_at,
      updated_at: new Date().toISOString(),
    };

    const supabase = getServerSupabase();
    const { data: updatedData, error } = await supabase
      .from("news")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ news: updatedData });
  } catch (err) {
    console.error("Error updating news:", err);
    return NextResponse.json(
      { error: "Failed to update news" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "News ID is required" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();
    const { error } = await supabase.from("news").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting news:", err);
    return NextResponse.json(
      { error: "Failed to delete news" },
      { status: 500 },
    );
  }
}
