import { HttpInterceptorFn } from '@angular/common/http';

export const rateLimiterInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
