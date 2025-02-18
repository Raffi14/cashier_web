"use server"

import { db } from '@/lib/database'; 
import { NextRequest, NextResponse } from 'next/server';
import { Auth } from '@/lib/auth';
import { sales } from '@/models/sales';
import { saleDetails, saleDetailSchema } from '@/models/sale_detail';
import { products } from '@/models/product';
import { eq, desc } from 'drizzle-orm';
import { customers } from '@/models/customers';

type ItemType = {
    id: number;
    quantity: number;
    sub_total: number;
    product_id: number; 
};

export async function POST(req: NextRequest) {
  try {
    const user = await Auth(req);
        if (!user) {
          return NextResponse.json({error : "Unauthorized "}, { status: 401 });
        }
    const { customer_id, items, sale_date, total_price } = await req.json();
    const [post] = await db.insert(sales).values({
      user_id: user[0].id,
      customer_id,
      sale_date,
      total_price
    }).returning();
    await db.insert(saleDetails).values(
        items.map((item : ItemType) => ({
            sale_id: post.id,
            product_id: item.product_id,
            quantity: item.quantity,
            sub_total: item.sub_total
        }))
    );

    await items.map(async (item: ItemType) => {
      const product = await db.select().from(products).where(eq(products.id, item.product_id)).execute();
      if (product.length == 0) {
        return NextResponse.json({error : "Data produk tidak ada"}, { status: 409 });
      }
      await db.update(products)
        .set({stock: product[0].stock - item.quantity}) 
        .where(eq(products.id, item.product_id)); 
    })
    
    return NextResponse.json({message: "success"}, {status: 200});
  } catch (error) {
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = Auth(req);
    if(!user){
      NextResponse.json({error: "Unauthorized"}, {status:401})
    }
    const transactions = await db
      .select({
        id: sales.id,
        customer_name: customers.name,
        total_price: sales.total_price,
        sale_date: sales.sale_date,
      })
      .from(sales)
      .leftJoin(customers, eq(sales.customer_id, customers.id))
      .orderBy(desc(sales.id));

    const transactionDetails = await db
      .select({
        sale_id: saleDetails.sale_id,
        product_name: products.product_name,
        quantity: saleDetails.quantity,
        sub_total: saleDetails.sub_total,
      })
      .from(saleDetails)
      .leftJoin(products, eq(saleDetails.product_id, products.id));

    const result = transactions.map((sale) => ({
      ...sale,
      items: transactionDetails.filter((detail) => detail.sale_id === sale.id),
    }));

    return NextResponse.json({message: "success", data: result});
  } catch (error) {
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

