import { Hono } from "hono";
import { cors } from "hono/cors";
import _ from "lodash";
import { usersGoogleSignIn } from "./api/users/googleSignIn";
import { usersCreateSignUpWithEmail } from "./api/users/create/signUpWithEmail";
import { usersCreateVerifyEmail } from "./api/users/create/verifyEmail";
import { usersCreateVerificationCode } from "./api/users/create/verificationCode";
import { usersSignIn } from "./api/users/signIn";
import { reactionsReadUserReaction } from "./api/reactions/read/userReaction";
import { commentsCreate } from "./api/comments/create";
import { coursesReadByCategory } from "./api/courses/read/byCategory";
import { coursesRead } from "./api/courses/read";
import { coursesAddViewCount } from "./api/courses/addViewCount";
import { reactionsToCourse } from "./api/reactions/toCourse";
import { commentsReadFromCourse } from "./api/comments/read/fromCourse";
import { usersUpdateUsername } from "./api/users/update/username";
import { reactionsToComment } from "./api/reactions/toComment";
import { commentsCreateToCourse } from "./api/comments/create/toCourse";
import { coursesReadCourseId } from "./api/courses/read/[courseId]";
import { commentsCreateToComment } from "./api/comments/create/toComment";
import { commentsReadReplies } from "./api/comments/read/replies";
import { storageUpload } from "./api/storage/upload";
import { usersUpdateAvatarUrl } from "./api/users/update/avatarUrl";
import { usersResetPasswordsCreate } from "./api/users/resetPasswords/create";
import { usersResetPasswordsReset } from "./api/users/resetPasswords/reset";
import { usersResetPasswordsVerfiy } from "./api/users/resetPasswords/verify";
import { commentsDeleteRecursive } from "./api/comments/delete/recursive";
import { commentsDeleteReply } from "./api/comments/delete/reply";
import { commentsUpdateFlag} from "./api/comments/update/flag";
import { commentsUpdatePin } from "./api/comments/update/pin";

const app = new Hono<{ Bindings: CloudflareBindings }>();
app.use('/*', cors())
app.use('/*', async (c, next) => {
    const devApiKey = c.env.X_API_KEY
    const publicDevApiKey = c.env.PUBLIC_X_API_KEY
    const komaApiKey = c.env.KOMA_X_API_KEY
    const apiKey = c.req.header('X-API-KEY')

    const publicUrls = [
        `/test`,
    ]

    const komaUrls = [
        `/assets/getAllName`,
    ]

    const publicApiUrls = [
        `/assets/create`,
    ]

    // If public URLS
    if (_.includes(publicUrls, c.req.path)) {
        return await next()
    }
    // If no API
    if (!apiKey) return new Response(JSON.stringify({ success: false, message: "Missing API Key." }), { status: 401 })

    // If public API
    if (apiKey === publicDevApiKey && [...publicApiUrls].some(url => c.req.path.includes(url))) return await next()

    // If KOMA API
    if (apiKey === komaApiKey && [...komaUrls, ...publicApiUrls].some(url => c.req.path.includes(url))) return await next()

    // API KEY
    if (apiKey !== devApiKey) return new Response(JSON.stringify({ success: false, message: "Invalid API Key." }), { status: 403 })
    return await next()

})

app.get("/message", (c) => {
  return c.text("Hello Hono!");
});

// Users
app.post("/users/create/signUpWithEmail", usersCreateSignUpWithEmail)
app.post("/users/create/verificationCode", usersCreateVerificationCode)
app.post("/users/create/verifyEmail", usersCreateVerifyEmail)
app.post("/users/googleSignIn", usersGoogleSignIn)
app.post("/users/signIn", usersSignIn)
app.post("/users/update/username", usersUpdateUsername)
app.post("/users/update/avatarUrl", usersUpdateAvatarUrl)
app.post("/users/resetPasswords/create", usersResetPasswordsCreate)
app.post("/users/resetPasswords/reset", usersResetPasswordsReset)
app.post("/users/resetPasswords/verify", usersResetPasswordsVerfiy)

// Courses
app.get("/courses/read", coursesRead)
app.get("/courses/read/:courseId", coursesReadCourseId)
app.post("/courses/read/byCategory", coursesReadByCategory)
app.post("/courses/addViewCount", coursesAddViewCount)

// Reactions
app.post("/reactions/toCourse", reactionsToCourse)
app.post("/reactions/toComment", reactionsToComment)
app.post("/reactions/read/userReaction", reactionsReadUserReaction)

// Comments
app.post("/comments/create", commentsCreate)
app.post("/comments/create/toCourse", commentsCreateToCourse)
app.post("/comments/create/toComment", commentsCreateToComment)
app.post("/comments/read/fromCourse", commentsReadFromCourse)
app.post("/comments/read/replies", commentsReadReplies)
app.post("/comments/delete/recursive",commentsDeleteRecursive)
app.post("/comments/delete/reply",commentsDeleteReply)
app.post("/comments/update/flag",commentsUpdateFlag)
app.post("/comments/update/pin",commentsUpdatePin)

// Storage
app.post("/storage/upload", storageUpload)

export default {
  fetch: app.fetch,

  async scheduled(event: ScheduledEvent, env: CloudflareBindings, ctx: ExecutionContext) {
    if (event.cron === "* * * * *") {
        console.log("Run every minute")
    }


    if (event.cron === "0 0 * * *") {
        const db = env.DB
        const stmt = db.prepare(
            `
                UPDATE users
                SET commentsLeft = 50
            `
        )

        await stmt.bind().run()

    }
  }
}
