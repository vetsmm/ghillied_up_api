import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { async as cryptoRandomString } from 'crypto-random-string';
import { v4 } from 'uuid';
import { INVALID_TOKEN } from '../errors/errors.constants';
import { JwtService } from '@nestjs/jwt';
import { JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt/dist/interfaces';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TokensService {
    constructor(
        private configService: ConfigService,
        private jwtService: JwtService,
    ) {}

    /**
     * Sign a JWT
     * @param sub - Subject
     * @param pLoad - Object payload
     * @param expiresIn - Expiry string (vercel/ms)
     * @param options - Signing options
     */
    signJwt(
        sub: string,
        pLoad: object,
        expiresIn?: string,
        options?: JwtSignOptions,
    ) {
        const subject = {
            sub: sub,
        };
        const payload = {
            ...pLoad,
        };

        return this.jwtService.sign(
            { ...payload, ...subject },
            {
                ...options,
                expiresIn,
            },
        );
    }

    /**
     * Verify and decode a JWT
     * @param subject - Subject
     * @param token - JWT
     * @param options - Verify options
     */
    verify<T>(subject: string, token: string, options?: JwtVerifyOptions) {
        try {
            return this.jwtService.verify(token, {
                ...options,
                subject,
            }) as any as T;
        } catch (error) {
            throw new UnauthorizedException(INVALID_TOKEN);
        }
    }

    /**
     * Decode a JWT without verifying it
     * @deprecated Use verify() instead
     * @param token - JWT
     * @param options - Decode options
     */
    decode<T>(token: string, options?: jwt.DecodeOptions) {
        return this.jwtService.decode(token, options) as T;
    }

    /**
     * Generate a UUID
     */
    generateUuid() {
        return v4();
    }

    /**
     * Generate a cryptographically strong random string
     * @param length - Length of returned string
     * @param charactersOrType - Characters or one of the supported types
     */
    async generateRandomString(
        length = 32,
        charactersOrType = 'alphanumeric',
    ): Promise<string> {
        if (
            [
                'hex',
                'base64',
                'url-safe',
                'numeric',
                'distinguishable',
                'ascii-printable',
                'alphanumeric',
            ].includes(charactersOrType)
        )
            return cryptoRandomString({
                length,
                type: charactersOrType as
                    | 'hex'
                    | 'base64'
                    | 'url-safe'
                    | 'numeric'
                    | 'distinguishable'
                    | 'ascii-printable'
                    | 'alphanumeric',
            });
        return cryptoRandomString({
            length,
            characters: charactersOrType,
        });
    }
}
