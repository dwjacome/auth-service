import { BaseException } from './base.exception';

export class RetryLimitExceededException extends BaseException {
  constructor(message = 'You have exceeded the limit of attempts, please try again in 1 hour.', error = 'Limit of attempts') {
    super(message, error, 429);
  }
}
