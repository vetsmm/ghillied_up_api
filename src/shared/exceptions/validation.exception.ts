import { BadRequestException } from '@nestjs/common';

export class ValidationException extends BadRequestException {
  public errors?: string | object | any;

  constructor(objectOrError?: string | object | any, description?: string) {
    super(objectOrError, description);
    this.name = ValidationException.name;
    this.errors = objectOrError;
  }
}
