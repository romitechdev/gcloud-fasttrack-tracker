import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const profileUrl = cookieStore.get("profileUrl")?.value;

    if (!profileUrl) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { profileUrl } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Fetch the profile HTML
    const response = await fetch(profileUrl);
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch profile: ${response.statusText}` }, { status: 500 });
    }
    
    const htmlText = await response.text();

    // Parse badge names using Regex matching the exact HTML tags Google Skills Boost renders
    // e.g., <ql-dialog dismissalLabel='Dismiss' headline='Deploy and Manage Applications on Google App Engine' id='public-profile-award-modal-39'>
    const badgeRegex = /<ql-dialog[^>]*headline=['"]([^'"]+)['"]/g;
    const matches = Array.from(htmlText.matchAll(badgeRegex));
    const badges = matches.map(m => m[1].trim());

    if (badges.length === 0) {
      // In case they have 0 badges or tracking failed
      return NextResponse.json({ success: true, count: 0 });
    }

    // Mark matched labs as done
    let updatedCount = 0;
    for (const badgeName of badges) {
      if (!badgeName) continue;
      
      const lab = await prisma.lab.findFirst({
        where: { title: { contains: badgeName } }
      });
      
      if (lab) {
        await prisma.userLab.upsert({
          where: { userId_labId: { userId: user.id, labId: lab.id } },
          update: { isDone: true },
          create: { userId: user.id, labId: lab.id, isDone: true }
        });
        updatedCount++;
      }
    }

    return NextResponse.json({ success: true, count: updatedCount, totalFound: badges.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
