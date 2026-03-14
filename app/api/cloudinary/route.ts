import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
type CloudinaryImage = {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  format?: string;
  created_at?: string;
  bytes?: number;
  context?: { custom?: Record<string, string> };
};

type CloudinaryError = { error?: { message?: string } };

function jsonError(message: string, status = 400, extra?: unknown) {
  return NextResponse.json(
    { error: message, ...(extra ? { details: extra } : {}) },
    { status },
  );
}

function cleanEnv(value: string | undefined) {
  return value?.trim().replace(/^['"]|['"]$/g, "");
}

function parseCloudinaryUrl(value: string | undefined) {
  const url = cleanEnv(value);
  if (!url) return null;

  const match = url.match(
    /^cloudinary:\/\/([^:]+):([^@]+)@([^/?#]+)(?:[/?#].*)?$/i,
  );
  if (!match) return null;

  return { apiKey: match[1], apiSecret: match[2], cloudName: match[3] };
}

function getCloudinaryEnv() {
  const fromUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL);

  const cloudName =
    cleanEnv(process.env.CLOUDINARY_CLOUD_NAME) ?? fromUrl?.cloudName;
  const apiKey = cleanEnv(process.env.CLOUDINARY_API_KEY) ?? fromUrl?.apiKey;
  const apiSecret =
    cleanEnv(process.env.CLOUDINARY_API_SECRET) ?? fromUrl?.apiSecret;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary credentials. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET.",
    );
  }

  return { cloudName, apiKey, apiSecret };
}

function parseCloudinaryError(payload: unknown) {
  const obj = payload as CloudinaryError | null;
  const msg = obj?.error?.message;
  return typeof msg === "string" && msg.trim()
    ? msg
    : "Cloudinary request failed";
}

function buildBasicAuth(apiKey: string, apiSecret: string) {
  return `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`;
}

function buildSignature(
  params: Record<string, string | number | undefined>,
  apiSecret: string,
) {
  const payload = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  return createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

function sanitizeContextValue(value: string) {
  return value.replace(/[|=]/g, " ").trim();
}

function buildCloudinaryContext(description: string | undefined) {
  const normalized = description?.trim();
  if (!normalized) return undefined;
  return `description=${sanitizeContextValue(normalized)}`;
}

function extractImageDescription(image: CloudinaryImage) {
  return image.context?.custom?.description ?? "";
}

export async function GET(request: NextRequest) {
  try {
    const { cloudName, apiKey, apiSecret } = getCloudinaryEnv();
    const { searchParams } = new URL(request.url);

    const maxResults = searchParams.get("max_results") ?? "100";
    const prefix =
      searchParams.get("prefix") ??
      cleanEnv(process.env.CLOUDINARY_FOLDER) ??
      "";
    const nextCursor = searchParams.get("next_cursor");

    const query = new URLSearchParams({
      context: "true",
      max_results: maxResults,
      type: "upload",
    });
    if (prefix) query.set("prefix", prefix);
    if (nextCursor) query.set("next_cursor", nextCursor);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?${query.toString()}`,
      {
        headers: { Authorization: buildBasicAuth(apiKey, apiSecret) },
        cache: "no-store",
      },
    );

    const data = (await res.json()) as
      | { resources?: CloudinaryImage[]; next_cursor?: string }
      | CloudinaryError;

    if (!res.ok) return jsonError(parseCloudinaryError(data), res.status);

    const resources =
      "resources" in data && Array.isArray(data.resources)
        ? data.resources
        : [];
    const next = "next_cursor" in data ? data.next_cursor : undefined;

    return NextResponse.json({
      images: resources.map((img) => ({
        publicId: img.public_id,
        url: img.secure_url,
        width: img.width,
        height: img.height,
        format: img.format,
        createdAt: img.created_at,
        bytes: img.bytes,
        description: extractImageDescription(img),
      })),
      nextCursor: next,
    });
  } catch (e) {
    return jsonError(
      e instanceof Error ? e.message : "Internal server error",
      500,
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { cloudName, apiKey, apiSecret } = getCloudinaryEnv();
    const formData = await request.formData();

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return jsonError(
        "Missing file. Send multipart/form-data with a `file` field.",
        400,
      );
    }

    const folderValue = formData.get("folder");
    const folder =
      typeof folderValue === "string"
        ? folderValue.trim()
        : (cleanEnv(process.env.CLOUDINARY_FOLDER) ?? "");

    const descriptionValue = formData.get("description");
    const description =
      typeof descriptionValue === "string" ? descriptionValue.trim() : "";
    const context = buildCloudinaryContext(description);

    const timestamp = Math.floor(Date.now() / 1000);

    const signature = buildSignature(
      { context, folder: folder || undefined, timestamp },
      apiSecret,
    );

    const uploadData = new FormData();
    uploadData.set("file", file);
    uploadData.set("api_key", apiKey);
    uploadData.set("timestamp", String(timestamp));
    uploadData.set("signature", signature);
    if (folder) uploadData.set("folder", folder);
    if (context) uploadData.set("context", context);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: uploadData },
    );

    const data = (await res.json()) as CloudinaryImage | CloudinaryError;

    if (!res.ok) return jsonError(parseCloudinaryError(data), res.status);

    if (!("public_id" in data) || !("secure_url" in data)) {
      return jsonError("Unexpected Cloudinary upload response.", 502);
    }

    return NextResponse.json({
      image: {
        publicId: data.public_id,
        url: data.secure_url,
        width: data.width,
        height: data.height,
        format: data.format,
        createdAt: data.created_at,
        bytes: data.bytes,
        description,
      },
    });
  } catch (e) {
    return jsonError(
      e instanceof Error ? e.message : "Internal server error",
      500,
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { cloudName, apiKey, apiSecret } = getCloudinaryEnv();
    const body = (await request.json()) as {
      publicId?: string;
      public_id?: string;
      description?: string;
    } | null;

    const publicId = body?.publicId ?? body?.public_id;
    if (!publicId) return jsonError("Missing `publicId` in request body.", 400);

    if (typeof body?.description !== "string") {
      return jsonError("Missing `description` in request body.", 400);
    }

    const description = body.description.trim();
    const context = `description=${sanitizeContextValue(description)}`;
    const timestamp = Math.floor(Date.now() / 1000);

    const signature = buildSignature(
      { context, public_id: publicId, timestamp, type: "upload" },
      apiSecret,
    );

    const updateData = new URLSearchParams();
    updateData.set("public_id", publicId);
    updateData.set("type", "upload");
    updateData.set("context", context);
    updateData.set("timestamp", String(timestamp));
    updateData.set("api_key", apiKey);
    updateData.set("signature", signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/explicit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: updateData.toString(),
      },
    );

    const data = (await res.json()) as { public_id?: string } | CloudinaryError;

    if (!res.ok) return jsonError(parseCloudinaryError(data), res.status);

    return NextResponse.json({
      publicId: "public_id" in data ? data.public_id : publicId,
      description,
    });
  } catch (e) {
    return jsonError(
      e instanceof Error ? e.message : "Internal server error",
      500,
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { cloudName, apiKey, apiSecret } = getCloudinaryEnv();
    const body = (await request.json()) as {
      publicId?: string;
      public_id?: string;
      invalidate?: boolean;
    } | null;

    const publicId = body?.publicId ?? body?.public_id;
    if (!publicId) return jsonError("Missing `publicId` in request body.", 400);

    const shouldInvalidate = Boolean(body?.invalidate);
    const timestamp = Math.floor(Date.now() / 1000);

    const signature = buildSignature(
      {
        invalidate: shouldInvalidate ? "true" : undefined,
        public_id: publicId,
        timestamp,
      },
      apiSecret,
    );

    const deleteData = new URLSearchParams();
    deleteData.set("public_id", publicId);
    deleteData.set("timestamp", String(timestamp));
    deleteData.set("api_key", apiKey);
    deleteData.set("signature", signature);
    if (shouldInvalidate) deleteData.set("invalidate", "true");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: deleteData.toString(),
      },
    );

    const data = (await res.json()) as { result?: string } | CloudinaryError;

    if (!res.ok) return jsonError(parseCloudinaryError(data), res.status);

    return NextResponse.json({
      result: "result" in data ? data.result : undefined,
      publicId,
    });
  } catch (e) {
    return jsonError(
      e instanceof Error ? e.message : "Internal server error",
      500,
    );
  }
}
