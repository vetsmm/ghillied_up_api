import {
    GhillieStatus,
    PostStatus,
    ReactionType,
    ServiceBranch,
    ServiceStatus,
} from '@prisma/client';
import { Expose } from 'class-transformer';
import { OpenGraphResult } from '../../open-graph/dtos/open-graph-response';
import { LinkMeta } from '../../open-graph/dtos/link-meta';

export class PostFeedDto {
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
    @Expose()
    ownerUsername: string;
    @Expose()
    ownerBranch: ServiceBranch;
    @Expose()
    ownerServiceStatus: ServiceStatus;
    @Expose()
    ownerSlug: string;
    @Expose()
    postCommentsCount: number;
    @Expose()
    postReactionsCount: number;
    @Expose()
    currentUserReactionId: string | null;
    @Expose()
    currentUserReactionType: ReactionType | null;
    @Expose()
    ghillieName: string;
    @Expose()
    ghillieStatus: GhillieStatus;
    @Expose()
    ghillieImageUrl: string | null;
    @Expose()
    linkMeta?: LinkMeta | undefined;
}
