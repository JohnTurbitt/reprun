import { NextResponse } from "next/server";
import { hashPassword, normalizeEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateAuthPayload } from "@/lib/apiValidation";
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

  const email = normalizeEmail(validation.value.email);
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json(
      { errors: ["An account already exists for that email."] },
      { status: 409 },
    );
  }

  const token = createSessionToken();
  // Create the user and first session together so a successful signup leaves the
  // browser authenticated immediately.
  const user = await prisma.user.create({
    data: {
      email,
      name: validation.value.name,
      passwordHash: await hashPassword(validation.value.password),
      sessions: {
        create: {
          tokenHash: hashSessionToken(token),
          expiresAt: getSessionExpiry(),
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      subscription: true,
      createdAt: true,
    },
  });
  const response = NextResponse.json({ user }, { status: 201 });

  response.cookies.set(sessionCookieName, token, getSessionCookieOptions());

  return response;
}
