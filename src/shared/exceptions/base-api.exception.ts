import { HttpException } from '@nestjs/common';

export class BaseApiException extends HttpException {
  public localizedMessage: Record<string, string>;
  public details: string | Record<string, any>;
  public category: string;
  public subCategory: string;
  public context: Record<string, string>;

  constructor(
    message: string,
    status: number,
    localizedMessage?: Record<string, string>,
    category?: string,
    subCategory?: string,
    context?: Record<string, string>,
  ) {
    // Calling parent constructor of base Exception class.
    super(message, status);
    this.name = BaseApiException.name;
    this.localizedMessage = localizedMessage;
    this.category = category;
    this.subCategory = subCategory;
    this.context = context;
  }

  static builder() {
    return new BaseApiExceptionBuilder();
  }
}

export class BaseApiExceptionBuilder {
  private message: string;
  private status: number;
  private localizedMessage: Record<string, string>;
  private category: string;
  private subCategory: string;
  private context: Record<string, string>;

  constructor() {
    this.message = 'Internal server error';
    this.status = 500;
    this.localizedMessage = {};
    this.category = '';
    this.subCategory = '';
    this.context = {};
  }

  withMessage(message: string) {
    this.message = message;
    return this;
  }

  withStatus(status: number) {
    this.status = status;
    return this;
  }

  withLocalizedMessage(localizedMessage: Record<string, string>) {
    this.localizedMessage = localizedMessage;
    return this;
  }

  withCategory(category: string) {
    this.category = category;
    return this;
  }

  withSubCategory(subCategory: string) {
    this.subCategory = subCategory;
    return this;
  }

  withContext(context: Record<string, string>) {
    this.context = context;
    return this;
  }

  withBaseApiException(baseApiException: BaseApiException) {
    this.message = baseApiException.message;
    this.status = baseApiException.getStatus();
    this.localizedMessage = baseApiException.localizedMessage;
    this.category = baseApiException.category;
    this.subCategory = baseApiException.subCategory;
    this.context = baseApiException.context;
    return this;
  }

  build() {
    return new BaseApiException(
      this.message,
      this.status,
      this.localizedMessage,
      this.category,
      this.subCategory,
      this.context,
    );
  }
}
