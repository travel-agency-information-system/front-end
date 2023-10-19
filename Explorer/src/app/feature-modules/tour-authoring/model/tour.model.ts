import { Equipment } from "./equipment.model";

export interface Tour {
    id?: number;
    name: string;
    description: string;
    demandignessLevel: string;
    price: number;
    tags: string[];
    authorId : number;
    status:string;
    equipment: Equipment[];
}