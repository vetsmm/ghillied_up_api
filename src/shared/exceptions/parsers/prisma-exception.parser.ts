import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import {
  PrismaErrorCategory,
  GhilliedUpErrorCategories,
  PrismaErrorDetails,
} from '../categories';
import { BaseApiException } from '../base-api.exception';

export function buildError(
  prismaExcept: PrismaClientKnownRequestError,
): BaseApiException {
  function _parseTokens(
    prismaErrorCode: string,
    meta?: Record<string, unknown>,
  ): Record<string, string> {
    // Create a record where the key is an element in meta.target and the value is PrismaErrorDetails[prismaErrorCode].
    const tokens: Record<string, string> = {};
    if (meta && meta.target && meta.target instanceof Array) {
      for (const target of meta.target) {
        tokens[target] = PrismaErrorDetails[prismaErrorCode];
      }
    }
    return tokens;
  }

  return BaseApiException.builder()
    .withCategory(GhilliedUpErrorCategories.DatabaseError)
    .withSubCategory(
      PrismaErrorCategory[prismaExcept.code] ||
        PrismaErrorCategory.UnhandledError,
    )
    .withMessage(PrismaErrorDetails[prismaExcept.code])
    .withStatus(PrismaErrorCategory[prismaExcept.code] ? 400 : 500)
    .withContext(_parseTokens(prismaExcept.code, prismaExcept.meta))
    .build();
}

export const prismaParsers = {
  buildError,
};
