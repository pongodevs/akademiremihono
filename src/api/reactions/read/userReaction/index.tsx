import { Context } from "hono";

export const reactionsReadUserReaction = async (c: Context<{ Bindings: CloudflareBindings }>) => {
    const { targetId, userId } = await c.req.json()
    const db = c.env.DB
    
    if(!(targetId && userId)) return new Response(JSON.stringify({success:false, message:"Insufficient parameter"}),{
        status:400,
        headers:{
            "Content-Type": "application/json"
        }
    })

    // Read reaction from db
    const stmt = db.prepare(
        `
            SELECT value
            FROM reactions
            WHERE userId = ? AND targetId = ? AND targetType = 'course'
            LIMIT 1
        `
    )

    const reaction = await stmt.bind(
        userId,
        targetId
    ).first()

    if(!reaction) return new Response(JSON.stringify({success:true, message:"Reaction not found"}),{
        status:204,
        headers:{
            "Content-Type": "application/json"
        }
    })
    
    return new Response(JSON.stringify(reaction), { 
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    })
}