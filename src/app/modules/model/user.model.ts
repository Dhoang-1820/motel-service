export class User {
    id?: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    token?: string;
    refreshToken?: string;
    roles?: string;
}

export class ChangePassword {
    userId?: number
    oldPassword?: string
    newPassword?: string
}