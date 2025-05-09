export const ERROR_RESPONSES = {
  VALIDATION_ERROR: {
    errorCodeName: 'VALIDATION_ERROR',
    message: 'Validation failed',
    details: [
      'email must be valid, password must be at least 8 characters long',
    ],
    status: 400,
  },
  USER_ALREADY_EXISTS: {
    errorCodeName: 'USER_ALREADY_EXISTS',
    message: 'User Already Exists',
    details:
      'A user with email john.doe@example.com already exists in the system',
    status: 409,
  },
  INVALID_ROLE: {
    errorCodeName: 'INVALID_ROLE',
    message: 'Invalid Role',
    details: 'The role id: 999 is not valid. Valid roles are: 1, 2',
    status: 400,
  },
  INTERNAL_SERVER_ERROR: {
    errorCodeName: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    details: 'Error processing the request on the server',
    status: 500,
  },
  INVALID_CREDENTIALS: {
    errorCodeName: 'INVALID_CREDENTIALS',
    message: 'Invalid email or password',
    details: 'The provided credentials are incorrect',
    status: 401,
  },

  USER_NOT_ACTIVE: {
    errorCodeName: 'USER_NOT_ACTIVE',
    message: 'User not active',
    details: 'The user account is not active',
    status: 409,
  },
  EXTERNAL_SERVICE_ERROR: {
    errorCodeName: 'EXTERNAL_SERVICE_ERROR',
    message: 'External service error',
    details: 'Failed to communicate with the Star Wars API',
    status: 503,
  },
  FORBIDDEN: {
    errorCodeName: 'FORBIDDEN',
    message: 'Access denied',
    details: 'You do not have the required permissions to access this resource',
    status: 403,
  },
  UNAUTHORIZED: {
    errorCodeName: 'UNAUTHORIZED_ERROR',
    message: 'User does not have access to do this action',
    details: 'User does not have access to do this action',
    status: 401,
  },
  TOKEN_NOT_PROVIDED: {
    errorCodeName: 'TOKEN_NOT_PROVIDED',
    message: 'Token not provided',
    details: 'Token has not been provided',
    status: 401,
  },
  TOKEN_EXPIRED: {
    errorCodeName: 'TOKEN_EXPIRED',
    message: 'Token has expired',
    details: 'Token has expired',
    status: 401,
  },
  INVALID_TOKEN: {
    errorCodeName: 'INVALID_TOKEN',
    message: 'Token is not valid',
    details: 'Provided authentication token is invalid',
    status: 401,
  },
  MOVIE_NOT_FOUND: {
    errorCodeName: 'MOVIE_NOT_FOUND',
    message: 'Movie with id a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6 not found',
    details:
      'No movie exists with the provided id: a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
    status: 404,
  },
};
