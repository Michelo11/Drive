import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

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

  if (!data.newName)
    return NextResponse.json(
      { message: "No new name provided" },
      { status: 400 }
    );

  const file = await prisma.file.findUnique({
    where: {
      id,
    },
  });

  if (!file)
    return NextResponse.json({ message: "File not found" }, { status: 404 });

  const newPath = path.join(path.dirname(file.url), data.newName);

  fs.renameSync(file.url, newPath);

  const updatedFile = await prisma.file.update({
    where: {
      id,
    },
    data: {
      name: data.newName,
      url: newPath,
    },
  });

  return NextResponse.json(updatedFile);
});