import { Context } from "hono";
import { hashPassword } from "../../../../util";
import bcrypt from "bcryptjs";
import { Jwt } from "hono/utils/jwt";

export const usersResetPasswordsReset = async(c:Context<{Bindings:CloudflareBindings}>)=>{
    const {email, password} = await c.req.json()
    const db = c.env.DB
    const stmt = db.prepare(
        `
            SELECT *
            FROM users
            WHERE email = ?
        `        
    )
    const findUser = await stmt.bind(email).first() as any
    if(findUser){
        const isMatch = bcrypt.compareSync(password, findUser.password as string)
        if(!isMatch){
            console.log(findUser)
            // Change password in D1
            const hashedPassword = hashPassword(password)
            const updateStmt = db.prepare(
                `
                    UPDATE users
                    SET password = ?
                    WHERE email = ?
                `
            ).bind(hashedPassword, email)

            // Remove all reset password rows related to same email
            const deleteStmt = db.prepare(
                `
                    DELETE FROM resetPasswords
                    WHERE email = :email
                `
            ).bind(email)

            await db.batch([updateStmt, deleteStmt])
            // 

            const newFindUser = {...findUser,
                verificationCode:"",
                verificationCodeExpiryTime:0,
                isRegistered:true
            };

            const {password:newPassword, verificationCode, verificationCodeExpiryTime, ...safeUser} = newFindUser;
            const token = await Jwt.sign(safeUser, c.env.JWT_KEY)
            return new Response(JSON.stringify(token), {status:200})
        }
        else{
            return new Response(JSON.stringify({success:false, message:"Can't change password. Password same as before."}),{status:400})
        }
    }
    else{
        return new Response(JSON.stringify({success:false, message:"User not found."}),{status:404})
    }
}