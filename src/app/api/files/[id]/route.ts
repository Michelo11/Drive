import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import { NextResponse } from "next/server";

export const DELETE = auth(async (req, context) => {
  const { id } = await context.params as { id: string };

  if (!req.auth?.user)
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );

  await prisma.file.delete({
    where: {
      id: id,
    },
  });

  return NextResponse.json({ message: "File deleted" });
});

export const PATCH = auth(async (req, context) => {
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

  if (!data.content)
    return NextResponse.json(
      { message: "No content provided" },
      { status: 400 }
    );

  const file = await prisma.file.findUnique({
    where: {
      id,
    },
  });

  if (!file)
    return NextResponse.json({ message: "File not found" }, { status: 404 });

  fs.writeFileSync(file.url, data.content, "utf-8");

  await prisma.file.update({
    where: {
      id,
    },
    data: {
      lastUpdate: new Date(),
    },
  });

  return NextResponse.json(file);
});
