import { Context } from "hono";

export const reactionsToComment = async (c: Context<{ Bindings: CloudflareBindings }>) => {
    const { commentId, userId, reactionValue } = await c.req.json()
    const db = c.env.DB
    console.log(commentId, userId, reactionValue)
    
    if(!(commentId && userId && reactionValue != null)) return new Response(JSON.stringify({success:false, message:"Insufficient parameter"}),{status:400})

    // Check if reactions exist
    const stmt = db.prepare(
        `
            SELECT _id, value
            FROM reactions
            WHERE userId = ? AND targetId = ? AND targetType = 'comment'
            LIMIT 1
        `
    )
    const reaction = await stmt.bind(
        userId,
        commentId
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
            'comment', //targetType
            commentId, //targetId
            Date.now(), //createdAt
            reactionValue,
        )

        // Update like count in content
        if(reactionValue == 1)
        {
            const stmt2 = db.prepare(
                `
                    UPDATE comments
                    SET likeCount = likeCount + 1
                    WHERE _id = ?
                `
            ).bind(commentId)

            await db.batch([stmt1, stmt2])
        }
        if(reactionValue == -1)
        {
            const stmt2 = db.prepare(
                `
                    UPDATE comments
                    SET dislikeCount = dislikeCount + 1
                    WHERE _id = ?
                `
            ).bind(commentId)

            await db.batch([stmt1, stmt2])
        }
    
    }
    else{
        // If there's already reactions, only update the value
        console.log('Already there')
        const stmt1 = db.prepare(
            `
                UPDATE reactions
                SET value = ?
                WHERE userId = ? AND targetId = ?
            `
        ).bind(reactionValue, userId, commentId)
    
        // Update like count in content
        const prevValue = reaction.value
        console.log(reactionValue, prevValue)
        // If like
        if(reactionValue == 1){
            if(prevValue == 0){
                const stmt2 = db.prepare(
                    `
                        UPDATE comments
                        SET likeCount = likeCount + 1
                        WHERE _id = ?
                    `
                ).bind(commentId)
                
                await db.batch([stmt1, stmt2])
            }
            if(prevValue == -1){
                const stmt2 = db.prepare(
                    `
                        UPDATE comments
                        SET likeCount = likeCount + 1,
                            dislikeCount = dislikeCount - 1
                        WHERE _id = ?
                    `
                ).bind(commentId)
    
                await db.batch([stmt1, stmt2])
            }
        }
        // If dislike
        if(reactionValue == -1){
            if(prevValue == 0){
                const stmt2 = db.prepare(
                    `
                        UPDATE comments
                        SET dislikeCount = dislikeCount + 1
                        WHERE _id = ?
                    `
                ).bind(commentId)
                
                await db.batch([stmt1, stmt2])
            }
            if(prevValue == 1){
                const stmt2 = db.prepare(
                    `
                        UPDATE comments
                        SET dislikeCount = dislikeCount + 1,
                            likeCount = likeCount - 1
                        WHERE _id = ?
                    `
                ).bind(commentId)
                
                await db.batch([stmt1, stmt2])
            }
        }
        // If neutral
        if(reactionValue == 0){
            if(prevValue == 1){
                const stmt2 = db.prepare(
                    `
                        UPDATE comments
                        SET likeCount = likeCount - 1
                        WHERE _id = ?
                    `
                ).bind(commentId)
                
                await db.batch([stmt1, stmt2])
            }
            if(prevValue == -1){
                const stmt2 = db.prepare(
                    `
                        UPDATE comments
                        SET dislikeCount = dislikeCount - 1
                        WHERE _id = ?
                    `
                ).bind(commentId)
                
                await db.batch([stmt1, stmt2])
            }
        }
    }
    
    
    return new Response(JSON.stringify({ succes: true, message: `Successfully like commentId:${commentId}` }), { 
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    })
}