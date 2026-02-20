import { Context } from "hono";

export const commentsReadFromCourse = async (c: Context<{ Bindings: CloudflareBindings }>) => {
    const { courseId, userId, limit, offset, orderBy} = await c.req.json()
    const db = c.env.DB

    const getOrderBy = ()=>{
        if(orderBy === "newest"){
            return "ORDER BY c.isPinned DESC, c.createdAt DESC"
        }
        else if(orderBy === "top"){
            return "ORDER BY c.isPinned DESC, c.likeCount DESC, c.createdAt DESC"
        }
        else{
            return "ORDER BY c.isPinned DESC, c.createdAt DESC"
        }
    }

    const stmt = db.prepare(
        `
            SELECT 
                c.*,
                u.avatarUrl,
                u.username,
                r.value AS likeValue,
                f.value AS flagValue
            FROM comments c 
            LEFT JOIN users u
                ON c.userId = u._id

            -- LIKE reaction
            LEFT JOIN reactions r
                ON r.targetId = c._id 
                AND r.targetType = 'comment'
                AND r.userId = ?

            -- FLAG reaction
            LEFT JOIN reactions f
                ON f.targetId = c._id 
                AND f.targetType = 'flag'
                AND f.userId = ?

            WHERE c.courseId = ? 
                AND c.parentId = ''
                AND c.flagCount < 10

            ${getOrderBy()}
            LIMIT ? OFFSET ?
        `
    )

    const {results:comments} = await stmt.bind(userId, userId, courseId, limit, offset).all()
    return new Response(JSON.stringify(comments), { 
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    })
}