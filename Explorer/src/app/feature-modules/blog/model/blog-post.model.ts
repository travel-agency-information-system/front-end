export interface BlogPost {
    id?: number;
    userId?: number;
    title: string;
    description: string;
    creationDate: Date;
    imageUrls: string[] | null;
    status: BlogPostStatus;
}

export enum BlogPostStatus {
    Draft = 'DRAFT',
    Published = 'PUBLISHED',
    Closed = 'CLOSED',
}