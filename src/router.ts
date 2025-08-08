import express from "express";
const router = express.Router();
import memberController from "./controllers/member.controller";

// member uchun
router.post("/member/login", memberController.login);
router.post("/member/signup", memberController.signup);
router.get("/member/detail", memberController.verifyAuth);

// products uchun

// orders uchun

export default router;
