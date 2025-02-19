"use server";

import * as argon2 from "argon2";
import { db } from "@/lib/database";
import { users, userSchema } from "@/models/user";
import { eq, and } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { defaultConfig } from "@/envConfig";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, password } = userSchema.select
    .pick({ username: true, password: true })
    .parse(body);

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 }
    );
  }

  try {
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), eq(users.is_active, "active")))
      .limit(1)
      .execute();

    if (!user[0]) {
      return NextResponse.json(
        { error: "pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    const passwordMatch = await argon2.verify(user[0].password, password);

    if (!passwordMatch) {
      return NextResponse.json({ error: "password salah" }, { status: 404 });
    }

    const JWT_SECRET = defaultConfig.secretKey;
    if (!JWT_SECRET) {
      throw new Error("secret key not found");
    }
    const token = jwt.sign({ id: user[0].id, role: user[0].role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const response = NextResponse.json(
      {
        message: "Login successful",
      },
      { status: 200 }
    );
    response.cookies.set({
      name: "token",
      value: token,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.set({
      name: "role",
      value: user[0].role,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
