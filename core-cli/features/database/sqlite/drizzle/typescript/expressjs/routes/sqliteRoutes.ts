import express from "express";
import { getUsers } from "../controllers/sqliteController";

const router = express.Router();

router.get("/", getUsers);

export default router;
