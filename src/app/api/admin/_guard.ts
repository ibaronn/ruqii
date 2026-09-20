import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";

export async function unauthorized() {
  return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
}

export async function guardAdmin() {
  const admin = await getAdmin();
  if (!admin) return null;
  return admin;
}