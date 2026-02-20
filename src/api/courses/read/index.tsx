import { Context } from "hono"
import _ from "lodash"

export const coursesRead = async (c: Context<{ Bindings: CloudflareBindings }>) => {
    const db = c.env.DB
    const result = await db.prepare(`
        SELECT *
        FROM courses
    `).all()

    const rows = result.results

    if (!rows || rows.length === 0) {
        return new Response(JSON.stringify({
            success: false,
            message: "Courses not found or has no categories"
        }), { status: 404 })
    }

    return new Response(JSON.stringify(rows), {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    })
}