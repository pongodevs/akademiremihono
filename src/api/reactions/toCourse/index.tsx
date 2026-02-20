import { Context } from "hono";

export const reactionsToCourse = async (c: Context<{ Bindings: CloudflareBindings }>) => {
    const { courseId, userId, reactionValue } = await c.req.json()
    const db = c.env.DB
    
    if(!(courseId && userId && reactionValue != null)) return new Response(JSON.stringify({success:false, message:"Insufficient parameter"}),{status:400})

    // Check if reactions exist
    const stmt = db.prepare(
        `
            SELECT _id, value
            FROM reactions
            WHERE userId = ? AND targetId = ?
            LIMIT 1
        `
    )
    const reaction = await stmt.bind(
        userId,
        courseId
    ).first() as any
    
    if(!reaction){
        // If not found
        // Add reactions to DB
        const stmt1 = db.prepare(
            `
                INSERT INTO reactions (_id, userId, targetType, targetId, createdAt, value)
                VALUES (:_id, :userId, :targetType, :targetId, :createdAt, :value)
            `
        ).bind(
            crypto.randomUUID(), //_id
            userId, // userId
            'course', //targetType
            courseId, //targetId
            Date.now(), //createdAt
            reactionValue,
        )

        // Update like count in content
        if(reactionValue == 1)
        {
            const stmt2 = db.prepare(
                `
                    UPDATE courses
                    SET likeCount = likeCount + 1
                    WHERE _id = ?
                `
            ).bind(courseId)

            await db.batch([stmt1, stmt2])
        }
        if(reactionValue == -1)
        {
            const stmt2 = db.prepare(
                `
                    UPDATE courses
                    SET dislikeCount = dislikeCount + 1
                    WHERE _id = ?
                `
            ).bind(courseId)

            await db.batch([stmt1, stmt2])
        }
    
    }
    else{
        // If there's already reactions, only update the value
        const stmt1 = db.prepare(
            `
                UPDATE reactions
                SET value = ?
                WHERE userId = ? AND targetId = ?
            `
        ).bind(reactionValue, userId, courseId)
    
        // Update like count in content
        const prevValue = reaction.value
        // If like
        if(reactionValue == 1){
            if(prevValue == 0){
                const stmt2 = db.prepare(
                    `
                        UPDATE courses
                        SET likeCount = likeCount + 1
                        WHERE _id = ?
                    `
                ).bind(courseId)
                
                await db.batch([stmt1, stmt2])
            }
            if(prevValue == -1){
                const stmt2 = db.prepare(
                    `
                        UPDATE courses
                        SET likeCount = likeCount + 1,
                            dislikeCount = dislikeCount - 1
                        WHERE _id = ?
                    `
                ).bind(courseId)
    
                await db.batch([stmt1, stmt2])
            }
        }
        // If dislike
        if(reactionValue == -1){
            if(prevValue == 0){
                const stmt2 = db.prepare(
                    `
                        UPDATE courses
                        SET dislikeCount = dislikeCount + 1
                        WHERE _id = ?
                    `
                ).bind(courseId)
                
                await db.batch([stmt1, stmt2])
            }
            if(prevValue == 1){
                const stmt2 = db.prepare(
                    `
                        UPDATE courses
                        SET dislikeCount = dislikeCount + 1,
                            likeCount = likeCount - 1
                        WHERE _id = ?
                    `
                ).bind(courseId)
                
                await db.batch([stmt1, stmt2])
            }
        }
        // If neutral
        if(reactionValue == 0){
            if(prevValue == 1){
                const stmt2 = db.prepare(
                    `
                        UPDATE courses
                        SET likeCount = likeCount - 1
                        WHERE _id = ?
                    `
                ).bind(courseId)
                
                await db.batch([stmt1, stmt2])
            }
            if(prevValue == -1){
                const stmt2 = db.prepare(
                    `
                        UPDATE courses
                        SET dislikeCount = dislikeCount - 1
                        WHERE _id = ?
                    `
                ).bind(courseId)
                
                await db.batch([stmt1, stmt2])
            }
        }
    }
    
    
    return new Response(JSON.stringify({ succes: true, message: `Successfully like courseId:${courseId}` }), { 
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    })
}