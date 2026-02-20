import { Context } from "hono";
import { Jwt } from "hono/utils/jwt";

export const usersUpdateAvatarUrl = async(c:Context<{Bindings:CloudflareBindings}>)=>{
    const {avatarUrl, userId} = await c.req.json()
    console.log(avatarUrl, userId)

    if(!avatarUrl || !userId) return new Response(JSON.stringify({success:false, message:`Insufficient parameters.`}),{
        status:400,
        headers:{
            "Content-Type": "application/json"
        }
    })

    const db = c.env.DB

    // Update username
    const stmt = db.prepare(
        `
            UPDATE users
            SET avatarUrl = ?
            WHERE _id = ?
        `
    )

    await stmt.bind(avatarUrl, userId).run()

    // Update token
    const stmt2 = db.prepare(
        `
            SELECT *
            FROM users
            WHERE _id = ?
        `
    )

    const newUser = await stmt2.bind(userId).first() as any

    const newFindUser = {...newUser,
        verificationCode:"",
        verificationCodeExpiryTime:0,
        isRegistered:true
    };

    const {password, verificationCode, verificationCodeExpiryTime, ...safeUser} = newFindUser;
    const token = await Jwt.sign(safeUser, c.env.JWT_KEY)

    return new Response(JSON.stringify({success:true, token, message:`Successfully update username.`}),{
        status:200,
        headers:{
            "Content-Type": "application/json"
        }
    })
}