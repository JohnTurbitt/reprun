import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSessionToken, sessionCookieName } from "@/lib/session";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(sessionCookieName)?.value;

  if (token) {
    await prisma.userSession.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.delete(sessionCookieName);

  return response;
}
