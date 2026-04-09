import { Router } from "express";
import { Container } from "typedi";
import { UserController } from "./user.controller";
import { UserMiddleware } from "./user.middleware";
import { AuthMiddleware } from "../auth/auth.middleware";

export class UserRoute {
    public router: Router;

    constructor() {
        this.router = Router();

        const userController = Container.get(UserController);
        const userMiddleware = Container.get(UserMiddleware);
        const authMiddleware = Container.get(AuthMiddleware);

        this.router.post("/create-user", userMiddleware.validateCreateUser, userController.createUser);

    }
}