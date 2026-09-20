import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const AUTH_COOKIE = "ruqi_admin_session";

const secret = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? "ruqi-secret"
);

export async function signSession(adminId: string) {
  return new SignJWT({ adminId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    const id = payload.adminId;
    return typeof id === "string" ? id : null;
  } catch {
    return null;
  }
}

export async function createSessionCookie(
  adminId: string,
  secure: boolean = process.env.NODE_ENV === "production"
) {
  const token = await signSession(adminId);
  cookies().set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearSessionCookie() {
  cookies().set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getAdmin() {
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (!token) return null;
  const adminId = await verifySessionToken(token);
  if (!adminId) return null;
  return prisma.adminUser.findUnique({
    where: { id: adminId },
    select: { id: true, username: true, name: true },
  });
}

export async function requireAdmin(
  redirectTo: string = "/admin/login"
): Promise<NonNullable<Awaited<ReturnType<typeof getAdmin>>>> {
  const admin = await getAdmin();
  if (!admin) {
    const { redirect } = await import("next/navigation");
    redirect(redirectTo);
  }
  return admin as NonNullable<Awaited<ReturnType<typeof getAdmin>>>;
}