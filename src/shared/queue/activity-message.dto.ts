import { ActivityType } from './activity-type';
import { DevicePushToken, PushNotificationSettings } from '@prisma/client';

export interface ActivityMessageDto<T> {
    activityType: ActivityType;
    message: T;
    devicePushTokens?: DevicePushToken[];
    pushNotificationSettings?: PushNotificationSettings;
    requestId?: string;
    userId?: string;
}
