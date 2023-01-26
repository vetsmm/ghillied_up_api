import { ConfigurationType } from './types';
import { int } from './config.utils';

export default (): ConfigurationType => ({
    env: process.env.NODE_ENV || 'development',
    appEnv: 'DEV',
    databaseUrl: process.env.DATABASE_URL,
    app: {
        name: 'Ghillied Up',
    },
    caching: {
        geolocationLruSize: int(process.env.GEOLOCATION_LRU_SIZE, 100),
        apiKeyLruSize: int(process.env.API_KEY_LRU_SIZE, 100),
    },
    security: {
        saltRounds: int(process.env.SALT_ROUNDS, 10),
        totpWindowPast: int(process.env.TOTP_WINDOW_PAST, 1),
        totpWindowFuture: int(process.env.TOTP_WINDOW_FUTURE, 0),
        mfaTokenExpiry: process.env.MFA_TOKEN_EXPIRY ?? '10m',
    },
    sms: {
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
        twilioAuthToken: process.env.TWILIO_ACCOUNT_TOKEN,
        twilioVerificationServiceSid:
            process.env.TWILIO_VERIFICATION_SERVICE_SID,
        senderPhoneNumber:
            process.env.TWILIO_SENDER_PHONE_NUMBER || '(925) 578-3532',
    },
    stream: {
        apiKey: process.env.STREAM_API_KEY,
        apiSecret: process.env.STREAM_API_SECRET,
        appId: process.env.STREAM_APP_ID,
    },
    aws: {
        region: process.env.AWS_REGION || 'us-east-1',
        publicBucketName:
            process.env.AWS_BUCKET_NAME || 'ghillied-up-qa-assets',
        sns: {
            activityArn:
                'arn:aws:sns:us-east-1:189846578713:activities-qa.fifo',
            accountPurgeArn:
                'arn:aws:sns:us-east-1:189846578713:account-purge-qa.fifo',
        },
    },
    sentryDsn:
        'https://324fb0002f5b4cde8686245e89346503@o228030.ingest.sentry.io/6615762',
    auth: {
        passwordResetTokenExpiryInMs:
            parseInt(process.env.AUTH_PASSWORD_RESET_TOKEN_EXPIRY_IN_MS) ||
            900000,
        activationCodeExpiryInMs:
            parseInt(process.env.AUTH_ACTIVATION_CODE_EXPIRY_IN_MS) || 3600000,
        subnetVerifyExpiryInMs:
            parseInt(process.env.AUTH_SUBNET_VERIFY_EXPIRY_IN_MS) || 1.8e6,
        registrationsEnabled: process.env.AUTH_REGISTIONS_ENABLED !== 'false',
    },
    port: process.env.APP_PORT,
    rateLimit: {
        public: {
            points: int(process.env.RATE_LIMIT_PUBLIC_POINTS, 250),
            duration: int(process.env.RATE_LIMIT_PUBLIC_DURATION, 3600),
        },
        authenticated: {
            points: int(process.env.RATE_LIMIT_AUTHENTICATED_POINTS, 5000),
            duration: int(process.env.RATE_LIMIT_AUTHENTICATED_DURATION, 3600),
        },
    },
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
        host: process.env.MAIL_HOST || 'email-smtp.us-east-1.amazonaws.com',
        user: process.env.MAIL_USER,
        password: process.env.MAIL_PASSWORD,
        defaultEmail:
            process.env.MAIL_DEFAULT_EMAIL || 'support@ghilliedup.com',
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
    firebase: {
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
        projectId: process.env.FIREBASE_PROJECT_ID,
    },
});
