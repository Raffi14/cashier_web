import { Auth } from "@/lib/auth";
import { db } from "@/lib/database";
import { customers } from "@/models/customers";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await Auth(req);
    if (!user) {
      return NextResponse.json({error : "Unauthorized "}, { status: 401 });
    }
    const { name, address, phone_number } = await req.json();
    const id = parseInt(await params.id);
       const getcustomer = await db
         .select()
         .from(customers)
         .where(eq(customers.id, id))
         .limit(1).execute();
 
       if (getcustomer.length == 0) {
         return NextResponse.json({error: "Data customer tidak ada"}, {status: 409})
       }
 
      await db.update(customers).set({ name, address, phone_number }).where(eq(customers.id, id)).execute();
      return NextResponse.json({message: "successful"}, {status: 200});
  } catch (error) {
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    if (!params || !params.id) {
      throw new Error("ID parameter is missing");
    }
    try {
      const user = await Auth(req);
      if (!user) {
        return NextResponse.json({error : "Unauthorized "}, { status: 401 });
      }

      const id = parseInt(params.id);
      if (isNaN(id)) {
        throw new Error("Invalid ID parameter");
      }
         const getcustomer = await db
           .select()
           .from(customers)
           .where(eq(customers.id, id))
           .limit(1).execute();
   
         if (getcustomer.length == 0) {
           return NextResponse.json({error: "Data customer tidak ada"}, {status: 409})
         }
   
        await db.delete(customers).where(eq(customers.id, id)).execute();
        return NextResponse.json({message: "successful"}, {status: 200});
    } catch (error) {
      return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
  }