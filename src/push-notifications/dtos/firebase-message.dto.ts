import { NotificationType } from './notification-type';

interface IFirebaseMessageDataDto {
    [key: string]: any;
    notificationType: NotificationType;
}
export interface ISendFirebaseMessageDto {
    token: string;
    title?: string;
    message: string;
    imageUrl?: string;
    data: IFirebaseMessageDataDto;
}

export interface IFirebaseMessageDto {
    title?: string;
    message: string;
    imageUrl?: string;
    data: IFirebaseMessageDataDto;
}
