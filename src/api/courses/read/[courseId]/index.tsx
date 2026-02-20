import { Context } from "hono"
import _ from "lodash"

export const coursesReadCourseId = async (c: Context<{ Bindings: CloudflareBindings }>) => {
    const courseId = c.req.param('courseId')
    const db = c.env.DB

    // Single query (sections + contents)
    const result = await db.prepare(`
        SELECT 
            cs.courseId,
            co.likeCount,
            co.dislikeCount,
            co.viewCount,
            co.commentCount,
            cs._id as sectionId,
            c._id as contentId,
            cs.title as sectionTitle,
            cs.position as sectionPosition,
            c.*
        FROM courseSections cs 
        LEFT JOIN contents c 
            ON c.sectionId = cs._id
        LEFT JOIN courses co
            ON co._id = cs.courseId
        WHERE cs.courseId = ?
    `).bind(courseId).all()

    const rows = result.results

    if (!rows || rows.length === 0) {
        return new Response(JSON.stringify({
            success: false,
            message: "Course not found or has no sections"
        }), { status: 404 })
    }

    // Group by sectionId
    const grouped = _.groupBy(rows, "sectionId")
    console.log(grouped)

    const sections = Object.keys(grouped).map((sectionId,index) => ({
        _id:sectionId,
        title:grouped[sectionId][0].sectionTitle,
        position:grouped[sectionId][0].sectionPosition,
        contents: grouped[sectionId]
            .map(r => ({
                _id: r.contentId,
                sectionId: r.sectionId,
                ...r
            }))
    }))

    const courseToWatch = {
        _id: courseId,
        likeCount:rows[0].likeCount,
        dislikeCount:rows[0].dislikeCount,
        viewCount:rows[0].viewCount,
        commentCount:rows[0].commentCount,
        sections
    }

    return new Response(JSON.stringify(courseToWatch), {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    })
}