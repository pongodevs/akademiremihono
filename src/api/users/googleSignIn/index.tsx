import { Context } from "hono";
import { Jwt } from "hono/utils/jwt";

export const usersGoogleSignIn = async (c: Context<{ Bindings: CloudflareBindings }>) => {
    const { email, name, imageUrl } = await c.req.json();
    const safeName = name || "";
    const nameArray = safeName.split(" ");
    const firstName = nameArray.length > 0 ? nameArray[0] : "";
    const lastName = nameArray.length > 1 ? nameArray[1] : "";

    
    const db = c.env.DB
    const stmt = db.prepare(
        `
            SELECT *
            FROM users
            WHERE email = :email
        `
    )
    const findUser = await stmt.bind(email).first() as any

    if (findUser) {
        const {password, verificationCode, verificationCodeExpiryTime, ...safeUser} = findUser;
        const token = await Jwt.sign(safeUser, c.env.JWT_KEY);
        
        if (findUser.isRegistered) {
            // If find user is registered
            return new Response(JSON.stringify({ success: true, message: "Your email has been registered.", token: token, user: findUser }), { status: 200 })
        }
        else {
            // If someone already try to register but not verify yet, we can replace with google account instead
            const stmt2 = db.prepare(
                `
                    UPDATE users
                    SET firstName = :firstName, lastName = :lastName, avatarUrl = :avatarUrl, verificationCode = :verificationCode, verificationCodeExpiryTime = :verificationCodeExpiryTime, isRegistered = :isRegistered, accountType = :accountType
                    WHERE email = :email
                `
            )

            await stmt2.bind(
                firstName, //firstName
                lastName, //lastName
                imageUrl ? imageUrl : "", //avatarUrl
                "", //verificationCode 
                0, //verificationCodeExpiryTime
                true,  //isRegistered
                'google', //accountType
                email, //email
            ).run()
            return new Response(JSON.stringify({ success: true, message: "Your email has been created using google.", token: token, user: findUser }), { status: 200 });
        }
    }
    else {
        // If user not found
        const stmt = db.prepare(
            `
                INSERT INTO users (_id, email, firstName, lastName, dateCreated, avatarUrl, password, isRegistered, verificationCode, verificationCodeExpiryTime, accountType)
                VALUES (:_id, :email, :firstName, :lastName, :dateCreated, :avatarUrl, :password, :isRegistered, :verificationCode, :verificationCodeExpiryTime, :accountType)
            `
        )

        const newUser = {
            _id: crypto.randomUUID(),
            email:email,
            firstName,
            lastName,
            dateCreated:Date.now(),
            avatarUrl:imageUrl?imageUrl:"",
            password:"",
            isRegistered:1,
            verificationCode:"",
            verificationCodeExpiryTime:0,
            accountType:"google"
        }

        // Insert into D1
        await stmt.bind(...Object.values(newUser)).run();

        const {password, verificationCode, verificationCodeExpiryTime, ...safeUser} = newUser;
        const token = await Jwt.sign(safeUser, c.env.JWT_KEY);
        return new Response(JSON.stringify({ success: true, message: "Your email has been registered with Google.", token: token, user: newUser }), { status: 200 });
    }
};

