import debug from 'debug';
import { compress } from './brotli';
import { NowLambda, MicronLambda, MicronParams, Micron } from './types';

const log = debug('micron\t');

const routeHandler: Micron = (fn): NowLambda => (req, res) => {
  try {
    const { body, query, cookies } = req;
    const ok = (data: any) => res.status(200).send(data);
    const badRequest = (msg: any) => res.status(400).send(msg);
    const unauthorized = (msg: any) => res.status(401).send(msg);
    const notFound = (msg: any) => res.status(404).send(msg);
    const error = (err: any) => res.status(500).send(err);
    const brotli = (data: any) => {
      res.setHeader("Content-Encoding", "br");
      return ok(Buffer.from(compress(data), "base64"));
    };

    return fn({
      req,
      res,
      body,
      query,
      cookies,
      ok,
      brotli,
      badRequest,
      unauthorized,
      notFound,
      error
    });
  } catch (err) {
    log("❌ UNCAUGHT ERROR!!!!", err);
    return res.status(500).send({ success: false, error: err.toString() });
  }
};

const isValidMethod = (method: string = "") =>
  ["GET", "PUT", "POST", "PATCH", "DELETE"].includes(method.toUpperCase());

const routeType = (method: string): Micron => (fn: MicronLambda) =>
  routeHandler((params: MicronParams) => {
    const { req, notFound } = params;
    if (!isValidMethod(method)) return notFound();

    return (req.method === method && fn(params)) || notFound();
  });


type MatchActions = {
  [key: string]: NowLambda
}

type ActionMap = {
  [key: string]: Micron
}

export * from './types';
export const get = routeType("GET");
export const put = routeType("PUT");
export const post = routeType("POST");
export const patch = routeType("PATCH");
export const del = routeType("DELETE");

const actionMap: ActionMap = { get, put, post, patch, del };

export const match = (actions: MatchActions): NowLambda => {
  return routeHandler(({ req, res, notFound }) => {
    const method = req.method?.toLowerCase() || '';
    const mcrn: Micron = actionMap[method];

    if(!mcrn) return notFound();

    const lambda:NowLambda = actions[method];
    if (!lambda) return notFound();

    return lambda(req, res);
  });
};

export default routeHandler;

