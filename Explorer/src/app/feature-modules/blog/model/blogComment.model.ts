export interface BlogComment {
    id?: number;
    blogPostId: number;
    userId: number;
    creationTime: Date;
    modificationTime?: Date;
    text: string;
}