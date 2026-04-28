import { NextResponse } from "next/server";
import { normalizeEmail, verifyPassword } from "@/lib/auth";
import { validateAuthPayload } from "@/lib/apiValidation";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  getSessionCookieOptions,
  getSessionExpiry,
  hashSessionToken,
  sessionCookieName,
} from "@/lib/session";

export async function POST(request: Request) {
  const validation = validateAuthPayload(await request.json().catch(() => null));

  if (!validation.valid || !validation.value) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(validation.value.email) },
  });

  if (!user || !(await verifyPassword(validation.value.password, user.passwordHash))) {
    return NextResponse.json(
      { errors: ["Email or password is incorrect."] },
      { status: 401 },
    );
  }

  const token = createSessionToken();

  // Logins create a new session rather than replacing old ones, which allows
  // multiple browsers/devices to stay signed in independently.
  await prisma.userSession.create({
    data: {
      userId: user.id,
      tokenHash: hashSessionToken(token),
      expiresAt: getSessionExpiry(),
    },
  });

  const response = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      subscription: user.subscription,
      createdAt: user.createdAt,
    },
  });

  response.cookies.set(sessionCookieName, token, getSessionCookieOptions());

  return response;
}
