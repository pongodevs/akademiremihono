import { Context } from "hono";
import { Jwt } from "hono/utils/jwt";

export const usersCreateVerifyEmail = async(c:Context<{Bindings:CloudflareBindings}>)=>{
    const db = c.env.DB
    const {email, verificationCode:verificationCodeFromClient} = await c.req.json()

    const stmt1 = db.prepare(
        `
            SELECT *
            FROM users
            WHERE email = :email
        `
    ) 
    const findUser = await stmt1.bind(email).first() as any

    if(findUser){
        if(Date.now() > findUser.verificationCodeExpiryTime) return new Response(JSON.stringify({success:false, message:"Your verification code is expired."}),{status:400})
        if(findUser.verificationCode !== verificationCodeFromClient) return new Response(JSON.stringify({success:false, message:"Your verification code is invalid."}),{status:401})
        // If Verified
        const stmt2 = db.prepare(
            `
                UPDATE users
                SET verificationCode = :verificationCode, verificationCodeExpiryTime = :verificationCodeExpiryTime, isRegistered = :isRegistered
                WHERE email = :email
            `
        )
    
        // Update D1
        await stmt2.bind("", 0, true, email).run();

        const newFindUser = {...findUser,
            verificationCode:"",
            verificationCodeExpiryTime:0,
            isRegistered:true
        };

        const {password, verificationCode, verificationCodeExpiryTime, ...safeUser} = newFindUser;
        const token = await Jwt.sign(safeUser, c.env.JWT_KEY)
        return new Response(JSON.stringify({success:true, message:"Your email has been verified.", token:token, user:newFindUser}),{status:200})
    }
    else{
        // If not find user
        return new Response(JSON.stringify({success:false, message:"Email not found."}),{status:404})
    }

}