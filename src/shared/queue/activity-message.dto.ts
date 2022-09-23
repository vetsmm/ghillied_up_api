import {ActivityType} from "./activity-type";
import {DevicePushToken} from "@prisma/client";

export interface ActivityMessageDto<T> {
    activityType: ActivityType;
    message: T;
    devicePushTokens?: DevicePushToken[];
    requestId?: string;
    userId?: string;
}
