import { users } from '@prisma/client';

export type GetMeResponse = Omit<users, 'password_hash'>;

export function toGetMeResponse(user: users): any {
    const { password_hash, ...rest } = user;
    const profileId = user.role === "HR" ? (user as any).hr_profiles?.id : (user as any).candidates?.id;
    return {
        ...rest,
        role: user.role === "User" ? "CANDIDATE" : user.role,
        profile_id: profileId,
    };
}
