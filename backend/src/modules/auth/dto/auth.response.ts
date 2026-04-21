import { User } from '@prisma/client';

export type GetMeResponse = Omit<User, 'passwordHash'>;

export function toGetMeResponse(user: User): GetMeResponse {
    const { passwordHash, ...rest } = user;
    return rest;
}
