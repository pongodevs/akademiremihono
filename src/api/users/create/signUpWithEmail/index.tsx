import { Context } from "hono";
import { Resend } from 'resend';
import { generateVerificationCode, hashPassword} from "../../../../util";


export const usersCreateSignUpWithEmail = async(c:Context<{Bindings:CloudflareBindings}>) => {
    const resend = new Resend(c.env.RESEND_API_KEY)
    const {email, password} = await c.req.json()

    console.log(email, password)

    // First Check if users already exists
    const db = c.env.DB
    const stmt = db.prepare(
        `
            SELECT isRegistered, verificationCodeExpiryTime
            FROM users
            WHERE email = :email
        `
    ) 
    const findUser = await stmt.bind(email).first()

    console.log(findUser)
    
    if(findUser){
        // Check if user has already been registered and verification code less than 1 hours
        if(findUser.isRegistered){
            return new Response(JSON.stringify({success:false, message:"User has already been registered"}),{status:409})
        }
        else{
            // If found but not registered yet, just update the verification
            const verificationCode = generateVerificationCode()

            const stmt = db.prepare(
                `
                    UPDATE users
                    SET password = :password, verificationCode = :verificationCode, verificationCodeExpiryTime = :verificationCodeExpiryTime
                    WHERE email = :email
                `
            )

            // Update D1
            stmt.bind(hashPassword(password), verificationCode, Date.now() + (3600 * 1000), email).run()

            // Send email
            const {data, error} = await resend.emails.send({
                from: 'Akademi Remi <no-reply@akademiremi.com>',
                to: [email],
                subject: 'Verification Code for Akademi Remi',
                text:`Your verification code: ${verificationCode}`
            });

            return new Response(JSON.stringify({success:true, message:"Your verification code is re-send to email, please check the code."}),{status:200})
        }
    }
    else{
        // If not found, create new one
        const stmt = db.prepare(
            `
                INSERT INTO users (_id, email, firstName, lastName, dateCreated, avatarUrl, password, isRegistered, verificationCode, verificationCodeExpiryTime, accountType, username)
                VALUES (:_id, :email, :firstName, :lastName, :dateCreated, :avatarUrl, :password, :isRegistered, :verificationCode, :verificationCodeExpiryTime, :accountType, :username)
            `
        )
        
        // Insert into D1
        const verificationCode = generateVerificationCode()
        const newUser = {
            _id: crypto.randomUUID(),
            email:email,
            firstName:"",
            lastName:"",
            dateCreated:Date.now(),
            avatarUrl:"",
            password:hashPassword(password),
            isRegistered:0,
            verificationCode:verificationCode,
            verificationCodeExpiryTime:Date.now() + (3600 * 1000),
            accountType:"manual",
            username:""
        }

        // Insert into D1
        await stmt.bind(...Object.values(newUser)).run();

        // Send email
        const {data, error} = await resend.emails.send({
            from: 'Akademi Remi <no-reply@akademiremi.com>',
            to: [email],
            subject: 'Verification Code for Akademi Remi',
            text:`Your verification code: ${verificationCode}`
        });

        console.log(data)
        console.log(error)
    
        return new Response(JSON.stringify({success:true, message:"Your account is created, please check email for verification"}),{status:200})

    }

}
 
