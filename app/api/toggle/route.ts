import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const profileUrl = cookieStore.get("profileUrl")?.value;

    if (!profileUrl) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { profileUrl },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id: labId, isDone, isError } = await request.json();

    const data: any = {};
    if (isDone !== undefined) data.isDone = isDone;
    if (isError !== undefined) data.isError = isError;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid parameters provided" }, { status: 400 });
    }

    const updatedUserLab = await prisma.userLab.upsert({
      where: {
        userId_labId: {
          userId: user.id,
          labId,
        },
      },
      update: data,
      create: {
        userId: user.id,
        labId,
        ...data,
      },
    });

    return NextResponse.json({ success: true, userLab: updatedUserLab });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
