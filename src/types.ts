import { NowRequest, NowResponse, NowRequestBody, NowRequestCookies, NowRequestQuery } from '@vercel/node';

type Any = {
  [index: string]: any
};

export type Request = NowRequest & Any;
export type Response = NowResponse & Any;

export interface Lambda {
  (req: Request, res: Response): Response | Promise<Response> | Promise<void>;
};

export interface ResponseHelper {
  (msg?: any): Response
};

export interface StringResponseHelper {
  (msg: string): Response
};

export type MicronParams = {
  req: Request,
  res: Response,
  body: NowRequestBody,
  cookies: NowRequestCookies,
  query: NowRequestQuery,
  ok: ResponseHelper,
  brotli: ResponseHelper,
  badRequest: ResponseHelper,
  unauthorized: ResponseHelper,
  notFound: ResponseHelper,
  error: ResponseHelper
}

export interface MicronLambda {
  (parms: MicronParams): Response | Promise<Response> | Promise<void>;
};

export interface Micron {
  (fn: MicronLambda): Lambda
}
