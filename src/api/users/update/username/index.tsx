import { Context } from "hono";
import { Jwt } from "hono/utils/jwt";

export const usersUpdateUsername = async(c:Context<{Bindings:CloudflareBindings}>)=>{
    const {username, userId} = await c.req.json()

    if(!username || !userId) return new Response(JSON.stringify({success:false, message:`Insufficient parameters.`}),{
        status:400,
        headers:{
            "Content-Type": "application/json"
        }
    })
    
    const db = c.env.DB

    // Find if username already there
    const stmt = db.prepare(
        `
            SELECT _id
            FROM users
            WHERE username = ?
        `
    )
    const findUser = await stmt.bind(username).first() as any

    // If there's already username
    if(findUser) return new Response(JSON.stringify({success:false, message:`Username already taken.`}),{
        status:409,
        headers:{
            "Content-Type": "application/json"
        }
    })

    // Update username
    const stmt2 = db.prepare(
        `
            UPDATE users
            SET username = ?
            WHERE _id = ?
        `
    )

    await stmt2.bind(username, userId).run()

    // Update token
    const stmt3 = db.prepare(
        `
            SELECT *
            FROM users
            WHERE _id = ?
        `
    )

    const newUser = await stmt3.bind(userId).first() as any

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