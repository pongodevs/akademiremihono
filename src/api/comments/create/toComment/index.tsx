import { Context } from "hono";

export const commentsCreateToComment = async (c: Context<{ Bindings: CloudflareBindings }>) => {
    const { _id, courseId, parentId, userId, content, likeCount, dislikeCount, createdAt } = await c.req.json()
    const db = c.env.DB

    // Check if Comments still left
    const stmt = db.prepare(
        `
            SELECT commentsLeft
            FROM users
            WHERE _id = ?
        `
    )

    const user = await stmt.bind(userId).first() as any

    if(user.commentsLeft === 0) return new Response(JSON.stringify({ succes: false, message: `Too much comment, please try again later.` }), { 
        status: 429,
        headers: {
            "Content-Type": "application/json"
        }
    })

    if(!user) return new Response(JSON.stringify({ succes: false, message: `User not found` }), { 
        status: 404,
        headers: {
            "Content-Type": "application/json"
        }
    })

    // Insert into comments
    const stmt1 = db.prepare(
        `
            INSERT INTO comments (_id, courseId, parentId, userId, content, likeCount, dislikeCount, createdAt)
            VALUES (:_id, :courseId, :parentId, :userId, :content, :likeCount, :dislikeCount, :createdAt)
        `
    ).bind(_id, courseId, parentId, userId, content, likeCount, dislikeCount, createdAt)

    // Update comments
    const stmt2 = db.prepare(
        `
            UPDATE comments
            SET replyCount = replyCount + 1
            WHERE _id = ?
        `
    ).bind(parentId)

    // Update users db
    const stmt3 = db.prepare(
        `
            UPDATE users
            SET commentsLeft = commentsLeft - 1
            WHERE _id = ?
        `
    ).bind(userId)

    await db.batch([stmt1, stmt2, stmt3])
    return new Response(JSON.stringify({ succes: true, message: `Successfully create comment` }), { 
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    })
}