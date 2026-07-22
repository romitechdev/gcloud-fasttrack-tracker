import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { profileUrl } = await request.json();

    if (!profileUrl || !profileUrl.startsWith("https://www.skills.google/public_profiles/")) {
      return NextResponse.json({ error: "Format URL profile tidak valid" }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { profileUrl },
      update: {},
      create: { profileUrl },
    });

    const cookieStore = await cookies();
    cookieStore.set("profileUrl", user.profileUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("profileUrl");
  return NextResponse.json({ success: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const profileUrl = cookieStore.get("profileUrl")?.value;
  
  if (!profileUrl) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: { profileUrl } });
}
