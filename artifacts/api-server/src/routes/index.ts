import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import menuRouter from "./menu";
import chefsRouter from "./chefs";
import reviewsRouter from "./reviews";
import ordersRouter from "./orders";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(menuRouter);
router.use(chefsRouter);
router.use(reviewsRouter);
router.use(ordersRouter);
router.use(dashboardRouter);
router.use(adminRouter);
router.use(uploadRouter);

export default router;
