"use server"

import { db } from '@/lib/database'; 
import { eq, desc } from 'drizzle-orm';
import { products } from '@/models/product';
import { NextRequest, NextResponse } from 'next/server';
import { Auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await Auth(req);
        if (!user) {
          return NextResponse.json({error : "Unauthorized "}, { status: 401 });
        }
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
      return NextResponse.json({message: "success"}, {status: 200});
  } catch (error) {
      return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await Auth(req);
    if (!user) {
      return NextResponse.json({error : "Unauthorized "}, { status: 401 });
    }
    const getProduk = await db.select().from(products).orderBy(desc(products.id)).execute();
    return NextResponse.json({message: "success", data: getProduk ?? []});
  } catch (error) {
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

