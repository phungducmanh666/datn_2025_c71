import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    SERVER_URL: process.env.SERVER_URL,
  });
}
