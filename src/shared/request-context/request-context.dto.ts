import { UserAccessTokenClaims } from '../auth/dtos';

export class RequestContext {
    public requestID: string;

    public url: string;

    public ip: string;

    public userAgent: string;
    public os: string;
    public platform: string;
    public isMobile: boolean;

    public user: UserAccessTokenClaims;
}
