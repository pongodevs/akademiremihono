import { Context } from "hono";
import { Resend } from 'resend';
import { publicStorageUrl, publicUrl } from "../../../../util";

export const usersResetPasswordsCreate = async(c:Context<{Bindings:CloudflareBindings}>)=>{
    const resend = new Resend(c.env.RESEND_API_KEY)

    const {email} = await c.req.json()
    const db = c.env.DB
    // Check if there's user
    const stmt = db.prepare(
        `
            SELECT *
            FROM users
            WHERE email = ?
        `
    )

    const findUser = await stmt.bind(email).first()
    
    if(findUser){
        const id = crypto.randomUUID()

        // Remove all reset password rows related to same email
        const deleteStmt = db.prepare(
            `
                DELETE FROM resetPasswords
                WHERE email = :email
            `
        ).bind(email)

        // Insert into D1
        const expiryTime = Date.now() + 10 * 60 * 1000 // 10 minutes from now
        const insertStmt = db.prepare(
            `
                INSERT INTO resetPasswords (_id, email, expiryTime)
                VALUES (:_id, :email, :expiryTime)

            `
        ).bind(id, email, expiryTime)

        await db.batch([deleteStmt, insertStmt])

        await resend.emails.send({
            from: 'Akademi Remi <no-reply@akademiremi.com>',
            to: [email],
            subject: 'Verification Code for Akademi Remi',
            text:`Here's the link for resseting your password: ${publicUrl}/resetPassword/${id}`
        });

        return new Response(JSON.stringify({sucess:false, message:"We've sent a link to your email to reset your password."}),{status:200})
    }
    else{
        return new Response(JSON.stringify({sucess:false, message:"Email not found."}),{status:404})
    }


}