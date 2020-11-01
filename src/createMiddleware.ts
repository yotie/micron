import { NowResponse } from '@vercel/node';
import { micron } from './micron';
import { Lambda, MicronParams, MicronMiddleware } from './types';

interface Middleware {
  (params: MicronParams, next: Function): NowResponse | undefined
}

export function createMiddleware(fn: Middleware): MicronMiddleware {
  return (lambda: Lambda) => micron(params => {
    const { req, res } = params;
    const next = () => lambda(req, res);

    return fn(params, next) || next();
  });
}
