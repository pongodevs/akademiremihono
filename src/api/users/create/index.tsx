import { Context } from "hono";

export const usersCreate = async (c: Context<{ Bindings: CloudflareBindings }>) => {
    const db = c.env.DB

    const { item } = await c.req.json()
    const { _id, affiliation, displayName, email, firstName, lastName, loginStatus, phone, photoUrl, pongoAddons, pongoLearn, pongoLibrary, referral, subscriptionStatus, transaction, password, verificationCode, verificationCodeExpiryTime, isRegistered, accountType } = item

    const stmt = db.prepare(
        `
            INSERT INTO users (_id, affiliation, displayName, email, firstName, lastName, loginStatus, phone, photoUrl, pongoAddons, pongoLearn, pongoLibrary, referral, subscriptionStatus, "transaction", password, verificationCode, verificationCodeExpiryTime, isRegistered, accountType)
            VALUES (:_id, :affiliation, :displayName, :email, :firstName, :lastName, :loginStatus, :phone, :photoUrl, :pongoAddons, :pongoLearn, :pongoLibrary, :referral, :subscriptionStatus, :transaction, :password, :verificationCode, :verificationCodeExpiryTime, :isRegistered, :accountType)
        `
    )

    await stmt.bind(
        _id,
        affiliation ? JSON.stringify(affiliation) : "",
        displayName ? displayName : "",
        email ? email : "",
        firstName ? firstName : "",
        lastName ? lastName : "",
        loginStatus ? JSON.stringify(loginStatus) : "",
        phone ? phone : "",
        photoUrl ? photoUrl : "",
        pongoAddons ? JSON.stringify(pongoAddons) : "",
        pongoLearn ? JSON.stringify(pongoLearn) : "",
        pongoLibrary ? JSON.stringify(pongoLibrary) : "",
        referral ? JSON.stringify(referral) : "",
        subscriptionStatus ? JSON.stringify(subscriptionStatus) : "",
        transaction ? JSON.stringify(transaction) : "",
        password ? password : "",
        verificationCode ? verificationCode : "",
        verificationCodeExpiryTime ? verificationCodeExpiryTime : 0,
        isRegistered ? isRegistered : false,
        accountType ? accountType : "manual"
    ).run()
    return new Response(JSON.stringify({ succes: true, message: `Successfully migrate ${email}` }), { status: 200 })
}