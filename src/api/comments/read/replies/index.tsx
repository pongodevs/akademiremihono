import { Context } from "hono";

export const commentsReadReplies = async (c: Context<{ Bindings: CloudflareBindings }>) => {
    const { userId, commentId, limit, offset} = await c.req.json()
    const db = c.env.DB
    const stmt = db.prepare(
        `
            SELECT 
                c.*,
                u.avatarUrl,
                u.username,
                f.value AS flagValue
            FROM comments c 

            -- USER
            LEFT JOIN users u
                ON c.userId = u._id

            -- FLAG reaction
            LEFT JOIN reactions f
                ON f.targetId = c._id 
                AND f.targetType = 'flag'
                AND f.userId = ?

            WHERE c.parentId = ? 
                AND c.flagCount < 10
            ORDER BY c.createdAt DESC
            LIMIT ? OFFSET ?
        `
    )

    const {results:replies} = await stmt.bind(userId, commentId, limit, offset).all()
    return new Response(JSON.stringify(replies), { 
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    })
}