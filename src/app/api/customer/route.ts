"use server";

import { db } from "@/lib/database";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { customers } from "@/models/customers";
import { Auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await Auth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized " }, { status: 401 });
    }
    const { name, address, phone_number } = await req.json();
    const getcustomer = await db
      .select()
      .from(customers)
      .where(eq(customers.name, name))
      .limit(1)
      .execute();

    if (getcustomer.length > 0) {
      return NextResponse.json(
        { error: "Data pelanggan dengan nama  sudah ada" },
        { status: 409 }
      );
    }

    await db
      .insert(customers)
      .values({ name, address, phone_number })
      .execute();
    return NextResponse.json(
      { message: "Data pelanggan berhasil ditambahkan" },
      { status: 200 }
    );
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
    const getcustomer = await db
      .select()
      .from(customers)
      .orderBy(desc(customers.id))
      .execute();
    return NextResponse.json({ message: "success", data: getcustomer ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
