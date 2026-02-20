import { Context } from "hono";

export const commentsUpdatePin = async(c:Context<{Bindings:CloudflareBindings}>)=>{
    const {commentId, pinValue} = await c.req.json()

    if(!commentId) return new Response(JSON.stringify({success:false, message:`Insufficient parameters.`}),{
        status:400,
        headers:{
            "Content-Type": "application/json"
        }
    })

    const db = c.env.DB

    // Update pin
    const stmt = db.prepare(
        `
            UPDATE comments
            SET isPinned = ?
            WHERE _id = ?
        `
    )

    await stmt.bind(pinValue, commentId).run()

    return new Response(JSON.stringify({success:true, message:`Successfully pinned comment.`}),{
        status:200,
        headers:{
            "Content-Type": "application/json"
        }
    })
}