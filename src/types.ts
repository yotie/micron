import { NowRequest, NowResponse, NowRequestBody, NowRequestCookies, NowRequestQuery } from '@vercel/node';

export interface NowLambda {
  (req: NowRequest, res: NowResponse): NowResponse | Promise<NowResponse>;
};

export interface ResponseHelper {
  (msg?: any): NowResponse
};

export interface StringResponseHelper {
  (msg: string): NowResponse
};

export type MicronParams = {
  req: NowRequest,
  res: NowResponse,
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
  (parms: MicronParams): NowResponse | Promise<NowResponse> | Promise<void>;
};

export interface Micron {
  (fn: MicronLambda): NowLambda
}
