import express from "express";
import { addIncome, getbyid, deleteIncome, updateIncome } from "../controller/incomecontroller.js";


const router = express.Router();


router.post("/addIncome/:id", addIncome);
router.get('/getbyid/:id', getbyid);
router.delete('/:id', deleteIncome);
router.put('/:id', updateIncome);


export default router;
