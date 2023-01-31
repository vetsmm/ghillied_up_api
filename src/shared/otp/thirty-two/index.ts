import base32 from 'base32';

import {
    Base32SecretKey,
    KeyDecoder,
    KeyEncoder,
    KeyEncodings,
    SecretKey,
} from '../core';

/**
 * - Key decoder using npm `thirty-two`
 */
export const keyDecoder: KeyDecoder = (
    encodedSecret: Base32SecretKey,
    encoding: KeyEncodings,
): SecretKey => {
    return base32.decode(encodedSecret).toString(encoding);
};

/**
 * - Key encoder using npm `thirty-two`
 */
export const keyEncoder: KeyEncoder = (
    secret: SecretKey,
    encoding: KeyEncodings,
): Base32SecretKey => {
    return base32
        .encode(Buffer.from(secret, encoding).toString('ascii'))
        .toString()
        .replace(/=/g, '');
};
