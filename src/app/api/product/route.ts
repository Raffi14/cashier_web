"use server"

import { db } from '@/lib/database'; 
import { eq, desc, and } from 'drizzle-orm';
import { products } from '@/models/product';
import { NextRequest, NextResponse } from 'next/server';
import { Auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await Auth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { product_name, price, stock } = await req.json();
    const getProduk = await db
      .select()
      .from(products)
      .where(eq(products.product_name, product_name))
      .execute();

    const activeProducts = getProduk.filter((p) => p.is_active === "active");
    const inactiveProducts = getProduk.filter((p) => p.is_active === "inactive");
    if (activeProducts.length > 0) {
      return NextResponse.json({ error: "Produk sudah ada" }, { status: 409 });
    }
    if (inactiveProducts.length === 1) {
      await db
        .update(products)
        .set({
          price,
          product_name,
          stock,
          is_active: "active",
        })
        .where(eq(products.id, inactiveProducts[0].id))
        .execute();

      return NextResponse.json({ message: "Produk berhasil ditambahkan" }, { status: 200 });
    }

    await db
      .insert(products)
      .values({ product_name, price, stock, is_active: "active" })
      .execute();

    return NextResponse.json({ message: "Produk berhasil ditambahkan" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await Auth(req);
    if (!user) {
      return NextResponse.json({error : "Unauthorized "}, { status: 401 });
    }
    const getProduk = await db.select().from(products).orderBy(desc(products.id)).where(eq(products.is_active, "active")).execute();
    return NextResponse.json({message: "success", data: getProduk ?? []});
  } catch (error) {
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

