import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export const GET = auth(async (req) => {
  if (!req.auth?.user)
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );

  const files = await prisma.file.findMany({
    where: {
      userId: req.auth.user.id,
    },
    orderBy: {
      lastUpdate: "desc",
    },
  });

  return NextResponse.json(files);
});

export const POST = auth(async (req) => {
  const data = await req.formData();

  if (!req.auth?.user)
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );

  const file = data.get("file") as File;

  if (!file)
    return NextResponse.json(
      {
        message: "No file provided",
      },
      {
        status: 400,
      }
    );

  const fileBuffer = await file.arrayBuffer();
  const uploadPath = path.join(process.cwd(), "uploads", randomUUID());

  if (!fs.existsSync(path.dirname(uploadPath))) {
    fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
  }

  fs.writeFileSync(uploadPath, Buffer.from(fileBuffer));

  const newFile = await prisma.file.create({
    data: {
      name: file.name,
      url: uploadPath,
      type: file.type,
      size: file.size,
      userId: req.auth.user.id,
    },
  });

  return NextResponse.json(newFile);
});

export const PUT = auth(async (req) => {
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

  if (
    !data.name ||
    !data.path ||
    typeof data.name !== "string" ||
    typeof data.path !== "string"
  )
    return NextResponse.json({ message: "No name provided" }, { status: 400 });

  await prisma.file.create({
    data: {
      name: data.name,
      url: "#",
      type: "folder",
      size: 0,
      userId: req.auth.user.id,
      path: data.path,
    },
  });

  return NextResponse.json({ success: true });
});
