import {ReactionType} from "@prisma/client";

export class PostReactionHydrated {
    sourceId: string;
    reactionType: ReactionType;
    username: string;
    ghillieId: string;
    ghillieName: string;
    ghillieImageUrl: string | null = null;
    postId: string;
}
