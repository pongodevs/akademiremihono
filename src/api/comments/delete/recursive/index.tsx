import { Context } from "hono";

export const commentsDeleteRecursive = async (c: Context<{ Bindings: CloudflareBindings }>) => {
    const {commentId, courseId} = await c.req.json()
    if(!commentId && !courseId) return new Response(JSON.stringify({success:false, message:"Insuficient parameter"}),{
        status:400,
        headers:{
            "Content-Type": "application/json"
        }
    })
    const db = c.env.DB
    const stmt1 = db.prepare(
        `
            DELETE
            FROM comments
            WHERE _id = ?
        `
    ).bind(commentId)

    const stmt2 = db.prepare(
        `
            DELETE
            FROM comments
            WHERE parentId = ?
        `
    ).bind(commentId)

    const stmt3 = db.prepare(
        `
            UPDATE courses
            SET commentCount = commentCount - 1
            WHERE _id = ?
        `
    ).bind(courseId)


    await db.batch([stmt1, stmt2, stmt3])
    return new Response(JSON.stringify({success:true, message:"Comment successfully deleted"}), { 
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    })
}