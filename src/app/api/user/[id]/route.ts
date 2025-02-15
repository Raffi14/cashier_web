import { Auth } from "@/lib/auth";
import { db } from "@/lib/database";
import { users } from "@/models/user";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await Auth(req);
        if (!user) {
          return NextResponse.json({error : "Unauthorized "}, { status: 401 });
    }
    const { full_name, username, role, password} = await req.json();
    const id = parseInt(await params.id);
       const getProduk = await db
         .select()
         .from(users)
         .where(eq(users.id, id))
         .limit(1).execute();
 
       if (getProduk.length == 0) {
         return NextResponse.json({error: "Data produk tidak ada"}, {status: 409})
       }
 
      await db.update(users).set({ full_name, username, role, password}).where(eq(users.id, id)).execute();
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
         const getProduk = await db
           .select()
           .from(users)
           .where(eq(users.id, id))
           .limit(1).execute();
   
         if (getProduk.length == 0) {
           return NextResponse.json({error: "Data user tidak ada"}, {status: 409})
         }
   
        await db.delete(users).where(eq(users.id, id)).execute();
        return NextResponse.json({message: "successful"}, {status: 200});
    } catch (error) {
      return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
  }