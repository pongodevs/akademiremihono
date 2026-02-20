import { Context } from "hono";

export const commentsCreate = async (c: Context<{ Bindings: CloudflareBindings }>) => {
    const { _id, courseId, parentId, userId, content, likeCount, dislikeCount, createdAt } = await c.req.json()
    const db = c.env.DB

    const stmt = db.prepare(
        `
            INSERT INTO comments (_id, courseId, parentId, userId, content, likeCount, dislikeCount, createdAt)
            VALUES (:_id, :courseId, :parentId, :userId, :content, :likeCount, :dislikeCount, :createdAt)
        `
    )

    await stmt.bind(_id, courseId, parentId, userId, content, likeCount, dislikeCount, createdAt).run()
    return new Response(JSON.stringify({ succes: true, message: `Successfully create comment` }), { 
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    })
}