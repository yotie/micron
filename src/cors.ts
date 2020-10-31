import debug from 'debug';
import matcher from 'matcher';
import { NowLambda } from './micron';

const log = debug('micron:cors');
const DEFAULT_ALLOW_METHODS = [ 'POST', 'GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS' ];
const DEFAULT_ALLOW_HEADERS = [
  'X-Requested-With',
  'Access-Control-Allow-Origin',
  'X-HTTP-Method-Override',
  'Content-Type',
  'Authorization',
  'Accept'
];

export type CorsOptions = {
  origin?: string,
  maxAge?: Number,
  allowMethods?: string[],
  allowHeaders?: string[],
  allowCredentials?: Boolean,
  exposeHeaders?: string[]
}

const cors = (options: CorsOptions = {}) => (fn: NowLambda): NowLambda =>
  (req, res) => {
    const {
      origin = '*',
      maxAge = 60 * 60 * 24,  // 24 hours
      allowMethods = DEFAULT_ALLOW_METHODS,
      allowHeaders = DEFAULT_ALLOW_HEADERS,
      allowCredentials = true,
      exposeHeaders = []
    } = options || {};

    if (res && res.writableEnded) return res;

    const protocol = req.headers['x-forwarded-proto'];
    const host = req.headers['x-forwarded-host'];
    const requestor = req.headers['origin']?.toString()
      || req.headers['referer']?.toString()
      || `${protocol}://${host}`;

    log('Incoming request from: ', requestor);
    const [domain=''] = matcher([requestor], origin.split(', '));
    if (!domain) {
      log('🛑 Request is coming from an unathorized origin', `${requestor}`);
      return res.status(401).send('Unauthorized');
    }

    res.setHeader('Access-Control-Allow-Origin', domain);
    if (allowCredentials)
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (exposeHeaders.length)
      res.setHeader('Access-Control-Expose-Headers', exposeHeaders.join(','));

    if (req.method === 'OPTIONS') {
      log('Handling OPTIONS pre-flight check')
      res.setHeader('Access-Control-Allow-Methods', allowMethods.join(','));
      res.setHeader('Access-Control-Allow-Headers', allowHeaders.join(','));
      res.setHeader('Access-Control-Max-Age', String(maxAge));
      return res.status(200).send('');
    }

    return fn(req, res);
  };

  export default cors;
