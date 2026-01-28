export enum ApiStatus {
  SUCCESS = "success",
  FAIL = "fail",
}

export enum ErrorCode {
  AUTH_FAILED = "AUTH_FAILED",
  TOKEN_EXPIRED = "RESET_TOKEN_INVALI",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
}

export enum UserType {
  ADMIN = "admin",
  SUB_ADMIN = "sub-admin",
  USER = "admin",
}