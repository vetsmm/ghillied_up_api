import {
  GhilliedUpErrorCategories,
  GhilliedUpErrorDetails,
} from '../categories';
import { HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ValidationException } from '../validation.exception';
import { BaseApiException } from '../base-api.exception';

export const validationExceptionParser = (
  validationException: ValidationException,
): BaseApiException => {
  function _parseTokens(
    errors?: Array<ValidationError>,
  ): Record<string, string> {
    const tokens: Record<string, string> = {};

    if (errors) {
      errors.forEach((error) => {
        const { property, constraints } = error;
        const [_, value] = Object.entries(constraints)[0];
        tokens[property] = value;
      });
    }

    return tokens;
  }

  return BaseApiException.builder()
    .withCategory(GhilliedUpErrorCategories.DatabaseError)
    .withSubCategory(GhilliedUpErrorCategories.ValidationError)
    .withMessage(GhilliedUpErrorDetails.ValidationError)
    .withStatus(HttpStatus.BAD_REQUEST)
    .withContext(_parseTokens(validationException.errors))
    .build();
};
