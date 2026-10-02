import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://path-lab-master.onrender.com";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ kind: string }> },
) {
  const { kind } = await params;
  const { searchParams } = new URL(request.url);
  const target = kind === "pdf"
    ? `${API_BASE_URL}/report/generate/pdf`
    : `${API_BASE_URL}/report/generate`;

  const url = new URL(target);
  for (const [key, value] of searchParams.entries()) {
    if (value !== null && value !== undefined && value !== "") {
      url.searchParams.append(key, value);
    }
  }

  try {
    const upstream = await fetch(url, {
      method: "GET",
      headers: {
        Accept: kind === "pdf" ? "application/pdf" : "application/vnd.ms-excel, application/octet-stream",
      },
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") || (kind === "pdf" ? "application/pdf" : "application/vnd.ms-excel");
    const buffer = Buffer.from(await upstream.arrayBuffer());

    return new NextResponse(buffer, {
      status: upstream.status,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="report.${kind === "pdf" ? "pdf" : "xls"}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to generate report" }, { status: 502 });
  }
}
