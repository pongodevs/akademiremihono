import { Context } from "hono";

export const usersReadEmail = async (c: Context<{ Bindings: CloudflareBindings }>) => {
    const { email } = await c.req.json()

    const db = c.env.DB
    const stmt = db.prepare(
        `
            SELECT *
            FROM users
            WHERE email = :email
        `
    )

    const user = await stmt.bind(email).first() as any
    if (!user) return new Response(JSON.stringify({ succes: false, message: "No user found" }), { status: 404 })
    const parsedUser = {
        ...user,
        affiliation: user.affiliation ? JSON.parse(user.affiliation) : "",
        loginStatus: user.loginStatus ? JSON.parse(user.loginStatus) : "",
        pongoAddons: user.pongoAddons ? JSON.parse(user.pongoAddons) : "",
        pongoLearn: user.pongoLearn ? JSON.parse(user.pongoLearn) : "",
        pongoLibrary: user.pongoLibrary ? JSON.parse(user.pongoLibrary) : "",
        referral: user.referral ? JSON.parse(user.referral) : "",
        subscriptionStatus: user.subscriptionStatus ? JSON.parse(user.subscriptionStatus) : "",
        transaction: user.transaction ? JSON.parse(user.transaction) : "",
    }

    console.log(parsedUser)

    return new Response(JSON.stringify(parsedUser), { status: 200 })
}
