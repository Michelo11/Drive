import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const POST = auth(async (req, context) => {
  const { id } = await context.params as { id: string };
  const data = await req.json();

  if (!req.auth?.user)
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );

  if (!data.newPath || typeof data.newPath !== "string")
    return NextResponse.json(
      { message: "Invalid newPath provided" },
      { status: 400 }
    );

  await prisma.file.update({
    where: {
      userId: req.auth.user.id,
      id,
    },
    data: {
      path: data.newPath.replace(" ", "-"),
    },
  });

  return NextResponse.json({ message: "File moved" });
});
