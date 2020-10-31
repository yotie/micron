import debug from 'debug';
import { NowRequest, NowResponse } from '@vercel/node';
import { NowLambda,  } from './micron';
import cors, { CorsOptions } from './cors';

// @internal
const log = debug('micron:createLambda');

// TIP: composition is a powerfull construct that micron leverages heavily,
// Learn more: https://mostly-adequate.gitbooks.io/mostly-adequate-guide/content/ch05.html
// @internal
const compose = (...fns: any[]) =>
  fns.reduce((f, g) =>
    (...args: any[]) => f(g && g(...args) || f(...args)), // Allow falsey functions to be passed in, by passing over them
    // Set initial value with blank HOF, so "f" above is always truthy on first iteration
    (fn: NowLambda) => async (req: NowRequest, res: NowResponse) => fn(req, res)
  );

export interface MicronMiddleware {
  (fn: NowLambda): NowLambda
}

export type LambdaOptions = {
  cors?: CorsOptions,
  middlewares?: MicronMiddleware[]
}

export function createLambda(service: NowLambda, opts: LambdaOptions = {}): NowLambda {
  const { cors: corsOptions, middlewares=[] } = opts;
  const baseMiddleware = [cors(corsOptions)];
  return compose(...baseMiddleware, ...middlewares)(service);
}
