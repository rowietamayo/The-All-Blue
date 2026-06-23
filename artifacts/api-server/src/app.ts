import cookieParser from "cookie-parser"
import cors from "cors"
import express, { type Express } from "express"
import pinoHttp from "pino-http"
import { logger } from "./lib/logger"
import { attachUserFromCookie } from "./middlewares/auth"
import router from "./routes"

const app: Express = express()

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        }
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        }
      },
    },
  }),
)
// Configure CORS to allow the frontend origin and include credentials for cookie auth.
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || process.env.VITE_API_BASE_URL;
const corsOptions: cors.CorsOptions = FRONTEND_ORIGIN
  ? { origin: FRONTEND_ORIGIN, credentials: true }
  : { origin: true, credentials: true };

app.use(cors(corsOptions));
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// attach user id from httpOnly JWT cookie to requests (populates req.headers['x-user-id'])
app.use(attachUserFromCookie)

app.use("/api", router)

export default app
