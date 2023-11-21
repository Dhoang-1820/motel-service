export class User {
    id?: number;
    username?: string;
    firstname?: string;
    lastname?: string;
    identifyNum?: string
    phone?: string;
    token?: string;
    refreshToken?: string;
    roles?: string;
    isActive?: boolean;
}

export class ChangePassword {
    userId?: number
    oldPassword?: string
    newPassword?: string
}