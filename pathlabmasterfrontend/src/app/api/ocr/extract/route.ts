import { NextRequest, NextResponse } from "next/server";

const OCR_UPSTREAM_URL = "https://ocr-y7tf.onrender.com/extract";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const upstream = await fetch(OCR_UPSTREAM_URL, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") ?? "application/json";
    const text = await upstream.text();

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("OCR proxy request failed", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Unable to process OCR request.",
      },
      { status: 502 },
    );
  }
}
