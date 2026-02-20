import { Context } from "hono";
import bcrypt from 'bcryptjs';
import { Jwt } from "hono/utils/jwt";
import { setCookie } from "hono/cookie";

export const usersSignIn = async(c:Context<{Bindings:CloudflareBindings}>)=>{
    const {email, password} = await c.req.json()
    const db = c.env.DB

    const stmt = db.prepare(
        `
            SELECT *
            FROM users
            WHERE email = :email
        `
    )
    const user = await stmt.bind(email).first() as any
    if(user){
        const isMatch = bcrypt.compareSync(password, user.password)

        if(isMatch){
            const {password, verificationCode, verificationCodeExpiryTime, ...safeUser} = user;
            const token = await Jwt.sign(safeUser, c.env.JWT_KEY)
            return new Response(JSON.stringify(token), {status:200})
        }
        else{
            return new Response(JSON.stringify({success:false, message:"Incorrect password."}),{status:401})
        }
    }
    else{
        return new Response(JSON.stringify({success:false, message:"User not found."}),{status:404})
    }
}