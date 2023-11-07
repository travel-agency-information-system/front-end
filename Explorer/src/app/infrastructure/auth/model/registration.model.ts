export interface Registration {
    name: string,
    surname: string,
    email: string,
    username: string,
    password: string,
    role: string,
    profileImageBytes: Uint8Array;
    biography: string,
    motto: string;
}