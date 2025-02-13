"use server"

import { db } from '@/lib/database'; 
import { eq } from 'drizzle-orm';
import { products } from '@/models/product';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
      const { product_name, price, stock } = await req.json();
       const getProduk = await db
         .select()
         .from(products)
         .where(eq(products.product_name, product_name))
         .limit(1).execute();
 
       if (getProduk.length > 0) {
         return NextResponse.json({error: "Data produk sudah ada"}, {status: 409})
       }
 
      await db.insert(products).values({ product_name, price, stock }).execute();
      return NextResponse.json({message: "successful"}, {status: 200});
  } catch (error) {
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

export async function GET(req: NextRequest) {
  try {
    const getProduk = await db.select().from(products).orderBy(products.id).execute();
    return NextResponse.json({message: "successful", data: getProduk ?? []});
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

