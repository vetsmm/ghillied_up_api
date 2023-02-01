export type ConfigurationType = {
    env: string;
    appEnv: 'DEV' | 'QA' | 'PROD';
    databaseUrl: string;
    rateLimit: {
        public: { points: number; duration: number };
        authenticated: { points: number; duration: number };
    };
    secretsSources?: {
        database: string;
        stream: string;
        firebase: string;
        jwt: string;
        mail: string;
        twilio: string;
    };
    app: {
        name: string;
    };
    stream: {
        apiKey: string;
        apiSecret: string;
        appId: string;
    };
    aws: {
        region: string;
        publicBucketName: string;
        sns: {
            activityArn:
                | 'arn:aws:sns:us-east-1:189846578713:activities-qa.fifo'
                | 'arn:aws:sns:us-east-1:189846578713:activities.fifo';
            accountPurgeArn:
                | 'arn:aws:sns:us-east-1:189846578713:account-purge-qa.fifo'
                | 'arn:aws:sns:us-east-1:189846578713:account-purge.fifo';
        };
    };
    sentryDsn: string;
    auth: {
        passwordResetTokenExpiryInMs: number | string;
        activationCodeExpiryInMs: number | string;
        registrationsEnabled: boolean;
        subnetVerifyExpiryInMs: number | string;
    };
    port: number | string;
    jwt: {
        publicKey: string;
        privateKey: string;
        accessTokenExpiresInSec: number;
        unusedRefreshTokenExpiryDays: number;
    };
    security: {
        saltRounds: number;
        totpWindowPast: number;
        totpWindowFuture: number;
        mfaTokenExpiry: string;
        passwordPwnedCheck?: boolean;
        inactiveUserDeleteDays: number;
    };
    sms: {
        twilioAccountSid?: string;
        twilioAuthToken?: string;
        twilioVerificationServiceSid?: string;
        senderPhoneNumber: string;
        retries?: number;
    };
    defaultAdminUserPassword: string;
    mail: {
        port: number;
        host: string;
        user: string;
        password: string;
        defaultEmail: string;
        defaultName: string;
        ignoreTLS: boolean;
        secure: boolean;
        requireTLS: boolean;
    };
    files: {
        images: {
            maxSize: number;
            allowedMimeTypes: Array<string>;
        };
    };
    firebase: {
        clientEmail: string;
        privateKey: string;
        projectId: string;
    };
    caching: {
        geolocationLruSize: number;
        apiKeyLruSize: number;
    };
};
