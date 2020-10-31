import { Lambda, Request, Response  } from './types';
import cors, { CorsOptions } from './cors';

// TIP: composition is a powerfull construct that micron leverages heavily,
// Learn more: https://mostly-adequate.gitbooks.io/mostly-adequate-guide/content/ch05.html
// @internal
const compose = (...fns: any[]) =>
  fns.reduce((f, g) =>
    (...args: any[]) => f(g && g(...args) || f(...args)), // Allow falsey functions to be passed in, by passing over them
    // Set initial value with blank HOF, so "f" above is always truthy on first iteration
    (fn: Lambda) => async (req: Request, res: Response) => fn(req, res)
  );

export interface MicronMiddleware {
  (fn: Lambda): Lambda
}

export type LambdaOptions = {
  cors?: CorsOptions,
  middlewares?: MicronMiddleware[]
}

export function createLambda(service: Lambda, opts: LambdaOptions = {}): Lambda {
  const { cors: corsOptions, middlewares=[] } = opts;
  const baseMiddleware = [cors(corsOptions)];
  return compose(...baseMiddleware, ...middlewares)(service);
}
