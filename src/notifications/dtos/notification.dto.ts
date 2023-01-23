import { Expose } from 'class-transformer';
import { NotificationType, ReactionType } from '@prisma/client';

export class NotificationDto {
    @Expose()
    id: string;

    @Expose()
    type: NotificationType;

    @Expose()
    message: string | null;

    @Expose()
    read: boolean;

    @Expose()
    trash: boolean;

    @Expose()
    createdDate: Date;

    @Expose()
    updatedDate: Date;

    @Expose()
    fromUserId: string | null;

    @Expose()
    toUserId: string;

    @Expose()
    sourceId: string;
}

export class BaseNotificationDto {
    @Expose()
    id: string;

    @Expose()
    read: boolean;

    @Expose()
    trash: boolean;

    @Expose()
    createdDate: Date;

    @Expose()
    type: NotificationType;
}

export class PostCommentNotificationDto extends NotificationDto {
    @Expose()
    declare sourceId: string;

    @Expose()
    commentContent: string;

    @Expose()
    username: string;

    @Expose()
    ghillieId: string;

    @Expose()
    ghillieName: string;

    @Expose()
    ghillieImageUrl: string | null = null;

    @Expose()
    postId: string;
}

export class PostCommentReactionNotificationDto extends NotificationDto {
    @Expose()
    declare sourceId: string;

    @Expose()
    reactionType: ReactionType;

    @Expose()
    username: string;

    @Expose()
    ghillieId: string;

    @Expose()
    ghillieName: string;

    @Expose()
    ghillieImageUrl: string | null = null;

    @Expose()
    postId: string;
}

export class PostReactionNotificationDto extends NotificationDto {
    @Expose()
    declare sourceId: string;

    @Expose()
    reactionType: ReactionType;

    @Expose()
    username: string;

    @Expose()
    ghillieId: string;

    @Expose()
    ghillieName: string;

    @Expose()
    ghillieImageUrl: string | null = null;

    @Expose()
    postId: string;
}
