"use server"

import { NextApiRequest, NextApiResponse } from 'next';
import * as argon2 from 'argon2';
import { db } from '@/lib/database'; 
import { Users } from '@/models/user';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
      const user = await db
        .select()
        .from(Users)
        .where(eq(Users.username, username))
        .limit(1).execute();

      if (!user[0]) {
        return res.status(404).json({ error: 'Invalid username' });
      }

      const passwordMatch = await argon2.verify(user[0].password, password);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      return res.status(200).json({message: 'Login successful'});
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
