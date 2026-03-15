import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST() {
  try {
    const supabase = createServerClient();

    const start = Date.now();
    const { data, error } = await supabase
      .from("leagues")
      .select("id")
      .limit(1);
    const latency = Date.now() - start;

    if (error) {
      return NextResponse.json(
        { error: error.message, latency },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      latency,
      message: "Database connection successful",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Database connection failed", latency: null },
      { status: 500 },
    );
  }
}
