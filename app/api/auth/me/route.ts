import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/apiAuth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);

  return NextResponse.json({ user });
}
