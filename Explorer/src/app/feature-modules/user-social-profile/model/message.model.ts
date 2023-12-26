export interface Message {
    id?: number;
    senderId?: number;
    recipientId?: number;
    senderUsername: string;
    recipientUsername: string;
    title: string;
    sentDateTime: Date;
    readDateTime: Date;
    content: string;
    isRead: boolean;
}