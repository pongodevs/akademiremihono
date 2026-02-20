import { Context } from "hono";

export const usersResetPasswordsVerfiy = async (c:Context<{Bindings:CloudflareBindings}>)=>{
    const {id} = await c.req.json()
    const db = c.env.DB
    const stmt = db.prepare(
        `
            SELECT *
            FROM resetPasswords
            WHERE _id = ?
        `
    )

    const findResetPassword = await stmt.bind(id).first()
    if(findResetPassword){
        if(Date.now() < Number(findResetPassword.expiryTime)){
            return new Response(JSON.stringify({success:true, resetPassword:findResetPassword}),{status:200})
        }
        else{
            return new Response(JSON.stringify({success:false, message:'The link is expired.', resetPassword:findResetPassword}),{status:408})
        }
    }
    else{
        return new Response(JSON.stringify({success:false, message:"Reset Password Not Found."}),{status:404})

    }
}