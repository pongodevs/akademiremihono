import { Context } from "hono";

export const commentsUpdateFlag = async(c:Context<{Bindings:CloudflareBindings}>)=>{
    const {commentId, flagValue, userId} = await c.req.json()
    console.log(commentId, flagValue, userId)
    if(!commentId || flagValue === null || !userId) return new Response(JSON.stringify({success:false, message:`Insufficient parameters.`}),{
        status:400,
        headers:{
            "Content-Type": "application/json"
        }
    })

    const db = c.env.DB

    // Check if reactions exist
    const stmt = db.prepare(
        `
            SELECT _id, value
            FROM reactions
            WHERE userId = ? AND targetId = ? AND targetType = 'flag'
            LIMIT 1
        `
    )
    const reaction = await stmt.bind(
        userId,
        commentId
    ).first() as any

    console.log(reaction)


    if(reaction){
        const flagPrevValue = reaction.value
        if(flagPrevValue === 0 && flagValue === 1){
            // Update Flag Count
            const stmt1 = db.prepare(
                `
                    UPDATE comments
                    SET flagCount = flagCount + 1
                    WHERE _id = ?
                `
            ).bind(commentId)

            // Update Reactions
            const stmt2 = db.prepare(
                `
                    UPDATE reactions
                    SET value = ?
                    WHERE targetId = ?
                `
            ).bind(flagValue, commentId)

            await db.batch([stmt1, stmt2])
        
            return new Response(JSON.stringify({success:true, message:`Successfully pinned comment.`}),{
                status:200,
                headers:{
                    "Content-Type": "application/json"
                }
            })
        }
        if(flagPrevValue === 1 && flagValue === 0){
            // Update Flag Count
            const stmt1 = db.prepare(
                `
                    UPDATE comments
                    SET flagCount = flagCount - 1
                    WHERE _id = ?
                `
            ).bind(commentId)

            // Update Reactions
            const stmt2 = db.prepare(
                `
                    UPDATE reactions
                    SET value = ?
                    WHERE targetId = ?
                `
            ).bind(flagValue, commentId)
            
            await db.batch([stmt1, stmt2])
        
            return new Response(JSON.stringify({success:true, message:`Successfully pinned comment.`}),{
                status:200,
                headers:{
                    "Content-Type": "application/json"
                }
            })
        }
    }
    else{
        // If not
        if(flagValue === 1){
            // Update Flag Count
            const stmt1 = db.prepare(
                `
                    UPDATE comments
                    SET flagCount = flagCount + 1
                    WHERE _id = ?
                `
            ).bind(commentId)

            // Insert reactions
            // Add reactions to DB
            const stmt2 = db.prepare(
                `
                    INSERT INTO reactions (_id, userId, targetType, targetId, createdAt, value)
                    VALUES (:_id, :userId, :targetType, :targetId, :createdAt, :value)
                `
            ).bind(
                crypto.randomUUID(), //_id
                userId, // userId
                'flag', //targetType
                commentId, //targetId
                Date.now(), //createdAt
                flagValue, // value
            )
            await db.batch([stmt1, stmt2])
        
            return new Response(JSON.stringify({success:true, message:`Successfully pinned comment.`}),{
                status:200,
                headers:{
                    "Content-Type": "application/json"
                }
            })
        }
    }
    return new Response(JSON.stringify({success:true, message:`Successfully pinned comment.`}),{
        status:200,
        headers:{
            "Content-Type": "application/json"
        }
    })

}