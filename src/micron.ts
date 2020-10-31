import debug from 'debug';
import { compress } from './brotli';
import { Lambda, MicronLambda, MicronParams, Micron } from './types';

// @internal
const log = debug('micron\t');

export const micron: Micron = (fn): Lambda => (req, res) => {
  log('🚀 Launching micron lambda...\n🔗 Endpoint: ', req.url);
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

// @internal
const isValidMethod = (method: string = "") =>
  ["GET", "PUT", "POST", "PATCH", "DELETE"].includes(method.toUpperCase());

// @internal
const routeType = (method: string): Micron => (fn: MicronLambda) =>
  micron((params: MicronParams) => {
    const { req, res, notFound } = params;
    if (!isValidMethod(method)) {
      log(`🙅🏽 Method '${req.method}' Not Allowed`);
      return res.status(405).send('Method Not Allowed');
    }

    return (req.method === method && fn(params)) || notFound();
  });


type MatchActions = {
  [key: string]: MicronLambda
}

// @internal
type ActionMap = {
  [key: string]: Micron
}

export const get = routeType("GET");
export const put = routeType("PUT");
export const post = routeType("POST");
export const patch = routeType("PATCH");
export const del = routeType("DELETE");

// @internal
const actionMap: ActionMap = { get, put, post, patch, del };

export const match = (actions: MatchActions): Lambda => {
  return micron(({ req, res }) => {
    const method = req.method?.toLowerCase() || '';
    const mcrn: Micron = actionMap[method];
    const lambda:MicronLambda = actions[method];

    if(!mcrn || !lambda) {
      log(`🙅🏽 Method '${method}' Not Defined in match()`)
      return res.status(405).send('Method Not Allowed');
    }

    return mcrn(lambda)(req, res);
  });
};
