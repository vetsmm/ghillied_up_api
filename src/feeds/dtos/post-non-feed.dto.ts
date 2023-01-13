import {
    GhillieStatus,
    PostStatus,
    ReactionType,
    ServiceBranch,
    ServiceStatus,
} from '@prisma/client';
import { Expose, Transform } from 'class-transformer';

export class PostNonFeedDto {
    @Expose()
    id: string;
    @Expose()
    uid: string;
    @Expose()
    title: string;
    @Expose()
    content: string;
    @Expose()
    status: PostStatus;
    @Expose()
    ghillieId: string;
    @Expose()
    postedById: string;
    @Expose()
    createdDate: Date;
    @Expose()
    updatedDate: Date;
    @Expose()
    edited: boolean;
    @Expose()
    activityId: string | null;
    @Transform((value) => value.obj?.postedBy?.username, { toClassOnly: true })
    @Expose()
    ownerUsername: string;
    @Transform((value) => value.obj?.postedBy?.serviceBranch, {
        toClassOnly: true,
    })
    @Expose()
    ownerBranch: ServiceBranch;
    @Transform((value) => value.obj?.postedBy?.serviceStatus, {
        toClassOnly: true,
    })
    @Expose()
    ownerServiceStatus: ServiceStatus;
    @Transform((value) => value.obj?.postedBy?.slug, { toClassOnly: true })
    @Expose()
    ownerSlug: string;
    @Transform((value) => value.obj._count?.postComments, { toClassOnly: true })
    @Expose()
    postCommentsCount: number;
    @Transform((value) => value.obj._count?.postReaction, { toClassOnly: true })
    @Expose()
    postReactionsCount: number;

    @Transform(
        (value) => {
            return value.obj.postReaction !== undefined &&
                value.obj.postReaction.length > 0
                ? value.obj.postReaction.reactionType
                : null;
        },
        { toClassOnly: true },
    )
    @Expose()
    currentUserReactionType: ReactionType | null;
    @Expose()
    @Transform((value) => value.obj.ghillie?.name, { toClassOnly: true })
    ghillieName: string;
    @Expose()
    @Transform((value) => value.obj.ghillie?.status, { toClassOnly: true })
    ghillieStatus: GhillieStatus;
    @Expose()
    @Transform((value) => value.obj.ghillie?.imageUrl, { toClassOnly: true })
    ghillieImageUrl: string | null;

    @Expose()
    isPinned: boolean;
}
