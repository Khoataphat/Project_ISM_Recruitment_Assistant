import { Inject, Service } from "typedi";
import { CreateUserDto } from "./dto/create-user.dto";
import { PrismaService } from "../../../prisma/prisma.service"

@Service()
export class UserService {
    constructor(
        @Inject() private readonly prisma: PrismaService,
    ){}
    async createUser(userData: CreateUserDto) {
        try {
            const newUser = await this.prisma.user.create({
                data: {
                  email: userData.email,
                  fullName: userData.fullName,
                  passwordHash: userData.password,
                },
              });
              
              return newUser;            
        } catch (error) {
            console.error(error);
        }
    }
}