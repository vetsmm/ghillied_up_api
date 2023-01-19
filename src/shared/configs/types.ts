export type ConfigurationType = {
    env: string;
    appEnv: 'DEV' | 'QA' | 'PROD';
    databaseUrl: string;
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
    };
    port: number | string;
    jwt: {
        publicKey: string;
        privateKey: string;
        accessTokenExpiresInSec: number;
        refreshTokenExpiresInSec: number;
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
    };
};
