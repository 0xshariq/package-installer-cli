import express from "express";
import { getUsers } from "../controllers/prismaController";

const router = express.Router();

router.get("/", getUsers);

export default router;
