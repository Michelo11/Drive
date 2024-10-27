import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) =>
  auth(async (req, context) => {
    const { id } = context.params as { id: string };

    if (!req.auth?.user)
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );

    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    const filePath = path.resolve(file.url);
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${file.name}"`,
        "Content-Type": file.type,
      },
    });
  })(req, {
    params: await context.params,
  });
