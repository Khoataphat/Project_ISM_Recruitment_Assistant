import { Service } from "typedi";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express"
import { CreateUserDto } from "./dto/create-user.dto";

@Service()
export class UserMiddleware {
    public validateDto = (DtoClass: any) => {
        return async (req: Request, _res: Response, next: NextFunction) => {
            try {
                const dto = plainToInstance(DtoClass, req.body) as object;
                const validationErrors = await validate(dto);
                if (validationErrors.length > 0) {
                    const messages = validationErrors
                        .map(e => Object.values(e.constraints ?? {}))
                        .flat()
                        .join(', ');
                    throw new Error(messages);
                }
                next();
            } catch (error) {
                next(error);
            }
        };

        
    }
    public validateCreateUser = this.validateDto(CreateUserDto);
}