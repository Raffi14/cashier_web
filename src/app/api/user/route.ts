"use server";

import { db } from "@/lib/database";
import { eq, desc, and } from "drizzle-orm";
import { users } from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import { Auth } from "@/lib/auth";
import argon2, { argon2id } from "argon2";

export async function POST(req: NextRequest) {
  try {
    const user = await Auth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized " }, { status: 401 });
    }
    const { username, full_name, role, password } = await req.json();
    const getUsers = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), eq(users.is_active, "active")))
      .limit(1)
      .execute();

    const hash = await argon2.hash(password, {
      type: argon2id,
    });

    if (getUsers.length > 0) {
      return NextResponse.json(
        { error: "username sudah dipakai" },
        { status: 409 }
      );
    }

    await db
      .insert(users)
      .values({
        username,
        full_name,
        role,
        password: hash,
        is_active: "active",
      })
      .execute();
    return NextResponse.json({ message: "successful" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await Auth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized " }, { status: 401 });
    }
    const getUsers = await db
      .select()
      .from(users)
      .where(eq(users.is_active, "active"))
      .orderBy(desc(users.id))
      .execute();
    return NextResponse.json({ message: "successful", data: getUsers ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
