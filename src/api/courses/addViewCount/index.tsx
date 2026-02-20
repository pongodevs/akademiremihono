import { Context } from "hono";

export const coursesAddViewCount = async(c: Context<{ Bindings: CloudflareBindings }>)=>{
    const {courseId, userId} = await c.req.json()
    if(!courseId || courseId == "") return new Response(JSON.stringify({success:false, message:"course not found"}),{status:400})
    const db = c.env.DB

    const stmt1 = db.prepare(
        `
            UPDATE courses
            SET viewCount = viewCount + 1
            WHERE _id = ?
        `
    ).bind(courseId)

    const stmt2 = db.prepare(
        `
            INSERT INTO videoViews (_id, courseId, userId, watchedSeconds, createdAt)
            VALUES (?, ?, ?, ?, ?)
        `
    ).bind(
        crypto.randomUUID(),
        courseId,
        userId,
        0,
        Date.now()
    )

    await db.batch([stmt1, stmt2])

    return new Response(JSON.stringify({success:true, message:`Successfully add view count for course:${courseId}`}),{
        status:200,
        headers: {
            "Content-Type": "application/json"
        }
    })
}