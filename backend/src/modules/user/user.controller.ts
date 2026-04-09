import { Service, Inject } from "typedi";
import { UserService } from "./user.service";
import { AuthService } from "../auth/auth.service";
import { Request, Response, NextFunction } from "express";

@Service()
export class UserController {
    constructor(
        @Inject() private readonly userService: UserService,
        @Inject() private readonly authService: AuthService,
    ){}

    public createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await this.userService.createUser(req.body);
            res.status(201).json({message: 'User created successfully', user});
        } catch (error) {
            next(error);
        }
    }
}