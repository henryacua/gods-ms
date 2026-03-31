export enum UserErrors {
  USER_NOT_FOUND = 'User not found',
  USER_BY_EMAIL_NOT_FOUND = 'User by email not found',
  EMAIL_ALREADY_EXISTS = 'Email already exists',
  COULD_NOT_CREATE_USER = 'Could not create user',
  COULD_NOT_UPDATE_USER = 'Could not update user',
  COULD_NOT_DELETE_USER = 'Could not delete user',
  INVALID_CREDENTIALS = 'Invalid credentials',
  INVALID_RESET_PASSWORD_TOKEN = 'Invalid reset password token',
  NEW_PASSWORD_SAME_AS_OLD = 'New password is the same as the old one',
  TOKEN_EXPIRED = 'Token expired',
}
