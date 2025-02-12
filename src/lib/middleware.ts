import { NextRequest, NextResponse } from "next/server"
import { JwtPayload, verify, Jwt } from "jsonwebtoken";
import { defaultConfig } from "@/config";
import { db } from "./database";
import { Users } from "@/models/user";
import { eq } from "drizzle-orm";

export const Auth = async (req: NextRequest, res: NextResponse) => {
    const token = req.headers.get('token');
    if (!token) {
        return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }
    const decode = verify(token, defaultConfig.secretKey!) as JwtPayload
    const id = decode.id;
    const user = await db.select().from(Users).where(eq(Users.id, id)).execute();
    if(user.length == null){
        return new NextResponse(JSON.stringify({message: "Unauthorized"}), {status: 401});
    }
    return user;
}