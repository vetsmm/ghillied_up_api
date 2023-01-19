import { PushNotificationType } from './push-notification-type';

interface IFirebaseMessageDataDto {
    [key: string]: any;
    notificationType: PushNotificationType;
    notificationId?: string;
    performSilent?: boolean;
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
