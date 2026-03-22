import express from 'express'
import MyUserController from '../controllers/MyUserController.ts'
import { validateMyUserRequest } from '../middleware/validation.ts'

const router = express.Router()


//api/
router.post("/", MyUserController.createCurrentUser)
router.put("/",validateMyUserRequest, MyUserController.updateCurrentUser)
router.get("/", MyUserController.getCurrentUser)
//router.delete("/", MyUserController.deleteCurrentUser)

export default router