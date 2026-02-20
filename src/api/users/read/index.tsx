import { Context } from "hono";

const usersRead = async(c:Context<{Bindings:CloudflareBindings}>) => {
    const db = c.env.DB
    const stmt = db.prepare(
        `
            SELECT *
            FROM users
        `
    )

    const users = await stmt.all() as any
    const parsedAssets = users.results.map((user:any)=>{
        return {...user,
            // dimensions:JSON.stringify(asset.dimensions), 
            // tags:JSON.stringify(asset.tags)
        }
    })

    return new Response(JSON.stringify(parsedAssets),{status:200})
}
 
export default usersRead;