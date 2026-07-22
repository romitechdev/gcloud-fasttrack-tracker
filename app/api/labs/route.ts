import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
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

    // Fetch all labs
    const labs = await prisma.lab.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        userLabs: {
          where: { userId: user.id },
        },
      },
    });

    // Map user-specific state to flat isDone/isError properties
    const mappedLabs = labs.map((lab) => {
      const userLab = lab.userLabs[0];
      return {
        id: lab.id,
        title: lab.title,
        url: lab.url,
        sortOrder: lab.sortOrder,
        isDone: userLab ? userLab.isDone : false,
        isError: userLab ? userLab.isError : false,
      };
    });

    return NextResponse.json({ labs: mappedLabs, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
