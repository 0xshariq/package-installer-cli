import { Router } from "express";
import { create, capture, refund } from "../controllers/paypalController.js";

const router = Router();

router.post("/create", create);
router.post("/capture", capture);
router.post("/refund", refund);

export default router;
