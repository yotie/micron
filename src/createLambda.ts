import debug from 'debug';
import { NowRequest, NowResponse } from '@vercel/node';
import { NowLambda,  } from './micron';
import cors, { CorsOptions } from './cors';

const log = debug('micron:createLambda');

const compose = (...fns: any[]) =>
  fns.reduce((f, g) =>
    (...args: any[]) => f(g && g(...args) || f(...args)), // Allow falsey functions to be passed in, by passing over them
    // Set initial value with blank HOF, so "f" above is always truthy on first iteration
    (fn: NowLambda) => async (req: NowRequest, res: NowResponse) => fn(req, res)
  );

const intro = (fn: NowLambda) =>
  (req: NowRequest, res: NowResponse) => {
    log("🚀 Launching micron lambda...");
    log('🔗 Endpoint: ', req.url);
    return fn(req, res);
  };



interface MicronMiddleware {
  (fn: NowLambda): NowLambda
}

type LambdaOptions = {
  cors?: CorsOptions,
  middlewares?: MicronMiddleware[]
}

export function createLambda(service: NowLambda, opts: LambdaOptions = {}): NowLambda {
  const { cors: corsOptions, middlewares=[] } = opts;
  const baseMiddleware = [cors(corsOptions), intro];
  return compose(...baseMiddleware, ...middlewares)(service);
}
