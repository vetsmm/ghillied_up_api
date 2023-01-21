import { UserAccessTokenClaims } from '../auth/dtos';

export class RequestContext {
    public requestID: string;

    public url: string;

    public ip: string;

    public user: UserAccessTokenClaims;
}
