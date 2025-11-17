import { Router } from "express";
import { getUsers } from "../controllers/sqliteController";

const router = Router();
router.get("/", getUsers);

export default router;
