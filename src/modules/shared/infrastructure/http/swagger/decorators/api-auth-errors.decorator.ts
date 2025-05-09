import { applyDecorators } from '@nestjs/common';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ERROR_RESPONSES } from '../error-responses';

export function ApiAuthErrors() {
  return applyDecorators(
    ApiUnauthorizedResponse({
      description:
        'Authentication issues - includes token not provided, expired, invalid or unauthorized user',
      content: {
        'application/json': {
          examples: {
            'Token not provided': {
              value: ERROR_RESPONSES.TOKEN_NOT_PROVIDED,
            },
            'Token expired': {
              value: ERROR_RESPONSES.TOKEN_EXPIRED,
            },
            'Invalid token': {
              value: ERROR_RESPONSES.INVALID_TOKEN,
            },
            'Unauthorized user': {
              value: ERROR_RESPONSES.UNAUTHORIZED,
            },
          },
        },
      },
    }),
  );
}
