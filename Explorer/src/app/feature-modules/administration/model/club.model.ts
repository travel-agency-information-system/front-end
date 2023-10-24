import { User } from 'src/app/infrastructure/auth/model/user.model';
export interface Club {
    id?: number,
    name: string, 
    description: string, 
    image: string,
    touristId: number,
    users: User[]
}