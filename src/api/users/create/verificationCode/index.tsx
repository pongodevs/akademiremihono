import { Context } from "hono";
import { Resend } from 'resend';
import { generateVerificationCode } from "../../../../util";

export const usersCreateVerificationCode = async(c:Context<{Bindings:CloudflareBindings}>)=>{
    const resend = new Resend(c.env.RESEND_API_KEY)
    const db = c.env.DB
    const {email} = await c.req.json()
    const verificationCode = generateVerificationCode()
    
    const stmt = db.prepare(
        `
            UPDATE users
            SET verificationCode = :verificationCode, verificationCodeExpiryTime = :verificationCodeExpiryTime
            WHERE email = :email
        `
    )

    // Update D1
    await stmt.bind(verificationCode, Date.now() + (3600 * 1000), email).run()

    // Send email
    await resend.emails.send({
        from: 'Akademi Remi <no-reply@akademiremi.com>',
        to: [email],
        subject: 'Verification Code for Akademi Remi',
        text:`Your verification code: ${verificationCode}`
    });

    return new Response(JSON.stringify({success:true, message:"Your verification code has been sent to email."}),{status:200})
}