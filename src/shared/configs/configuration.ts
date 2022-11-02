export default (): any => ({
    env: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL,
    app: {
        name: 'ghillied-up',
    },
    stream: {
        apiKey: process.env.STREAM_API_KEY,
        apiSecret: process.env.STREAM_API_SECRET,
        appId: process.env.STREAM_APP_ID,
        feeds: {
            user: 'user',
            notification: 'notification',
            newsFeeds: {
                flat: 'timeline',
                aggregated: 'timeline_aggregated',
            },
        },
    },
    aws: {
        region: process.env.AWS_REGION,
        publicBucketName: process.env.AWS_BUCKET_NAME,
        sns: {
            activityArn: process.env.AWS_SNS_ACTIVITY_ARN,
        },
    },
    sentryDsn:
        'https://324fb0002f5b4cde8686245e89346503@o228030.ingest.sentry.io/6615762',
    auth: {
        passwordResetTokenExpiryInMs:
            process.env.AUTH_PASSWORD_RESET_TOKEN_EXPIRY_IN_MS || 900000,
        activationCodeExpiryInMs:
            process.env.AUTH_ACTIVATION_CODE_EXPIRY_IN_MS || 3600000,
        registrationsEnabled: process.env.AUTH_REGISTIONS_ENABLED !== 'false',
    },
    port: process.env.APP_PORT,
    jwt: {
        publicKey: Buffer.from(
            process.env.JWT_PUBLIC_KEY_BASE64,
            'base64',
        ).toString('utf8'),
        privateKey: Buffer.from(
            process.env.JWT_PRIVATE_KEY_BASE64,
            'base64',
        ).toString('utf8'),
        accessTokenExpiresInSec: parseInt(
            process.env.JWT_ACCESS_TOKEN_EXP_IN_SEC,
            10,
        ),
        refreshTokenExpiresInSec: parseInt(
            process.env.JWT_REFRESH_TOKEN_EXP_IN_SEC,
            10,
        ),
    },
    defaultAdminUserPassword: process.env.DEFAULT_ADMIN_USER_PASSWORD,
    mail: {
        port: parseInt(process.env.MAIL_PORT, 10),
        host: process.env.MAIL_HOST,
        user: process.env.MAIL_USER,
        password: process.env.MAIL_PASSWORD,
        defaultEmail: process.env.MAIL_DEFAULT_EMAIL,
        defaultName: 'Ghillied Up',
        ignoreTLS: process.env.MAIL_IGNORE_TLS === 'true',
        secure: process.env.MAIL_SECURE === 'true',
        requireTLS: process.env.MAIL_REQUIRE_TLS === 'true',
    },
    files: {
        images: {
            maxSize: 2e7,
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
        },
    },
});
