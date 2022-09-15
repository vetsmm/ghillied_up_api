import {ActivityType} from "./activity-type";

export interface ActivityMessageDto<T> {
    activityType: ActivityType;
    message: T;
}
