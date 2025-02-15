import { NextRequest, NextResponse } from "next/server"
import { JwtPayload, verify, Jwt } from "jsonwebtoken";
import { defaultConfig } from "@/envConfig";
import { db } from "./database";
import { users } from "@/models/user";
import { eq } from "drizzle-orm";

export const Auth = async (req: NextRequest) => {
    const token = req.cookies.get('token')?.value;
    if (!token) {
        return null;
    }
    const decode = verify(token, defaultConfig.secretKey!) as JwtPayload
    const id = decode.id;
    const user = await db.select().from(users).where(eq(users.id, id)).execute();
    if(user.length == null){
        return null;
    }
    return user;
}