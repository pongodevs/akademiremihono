import { Context } from "hono";
import { Jwt } from "hono/utils/jwt";

export const usersUpdate = async(c:Context<{Bindings:CloudflareBindings}>)=>{
    const updateQuery = await c.req.json()
    const _id = updateQuery._id

    const updateQueryArray = Object.keys(updateQuery)
    const filteredUpdateQueryArray = updateQueryArray.filter(q=>{return q !== "_id"})

    let key = ""
    const value = [] as any
    filteredUpdateQueryArray.forEach((q,index)=>{
        key += `${index === 0? "":","}"${q}" = :${q}`
        const isArray = Array.isArray(updateQuery[q])
        const isObject = typeof updateQuery[q] === 'object' && updateQuery[q] !== null && !Array.isArray(updateQuery[q])
        const condition = isArray || isObject
        const val = condition? JSON.stringify(updateQuery[q]) : updateQuery[q]
        value.push(val)
    })

    const db = c.env.DB
    const stmt = db.prepare(
        `
            UPDATE users
            SET ${key}
            WHERE _id = :_id
        `
    )

    await stmt.bind(...value, _id).run()

    const stmt2 = db.prepare(
        `
            SELECT *
            FROM users
            WHERE _id = :_id
        `
    )
    const findUser = await stmt2.bind(_id).first() as any
    if(findUser){
        const newFindUser = {...findUser,
            affiliation:JSON.parse(findUser.affiliation),
            loginStatus:JSON.parse(findUser.loginStatus),
            pongoAddons:JSON.parse(findUser.pongoAddons),
            pongoLearn:JSON.parse(findUser.pongoLearn),
            pongoLibrary:JSON.parse(findUser.pongoLibrary),
            referral:JSON.parse(findUser.referral),
            subscriptionStatus:JSON.parse(findUser.subscriptionStatus),
            transaction:JSON.parse(findUser.transaction),
        }
        const token = await Jwt.sign(newFindUser, c.env.JWT_KEY)
        return new Response(JSON.stringify({success:true, message:`Successfully update users:${_id}.`, token, user:newFindUser}))
    }
    else{
        return new Response(JSON.stringify({success:false, message:`User not found.`}))
    }

}