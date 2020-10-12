import { createServer, IncomingMessage, ServerResponse } from 'http';
import { Readable } from 'stream';
import { NowRequest, NowRequestBody, NowRequestQuery, NowRequestCookies, NowResponse } from '@vercel/node';


function rawBody(readable: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    let bytes = 0;
    const chunks: Buffer[] = [];
    readable.on('error', reject);
    readable.on('data', chunk => {
      chunks.push(chunk);
      bytes += chunk.length;
    });
    readable.on('end', () => {
      resolve(Buffer.concat(chunks, bytes));
    });
  });
}

async function parseBody(req: NowRequest): Promise<NowRequestBody> {
  const body = await rawBody(req);

  if (!req.headers['content-type']) {
    return undefined;
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { parse: parseContentType } = require('content-type');
  const { type } = parseContentType(req.headers['content-type']);

  if (type === 'application/json') {
    try {
      const str = body.toString();
      return str ? JSON.parse(str) : {};
    } catch (error) {
      throw new ApiError(400, 'Invalid JSON');
    }
  }

  if (type === 'application/octet-stream') {
    return body;
  }

  if (type === 'application/x-www-form-urlencoded') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { parse: parseQS } = require('querystring');
    // note: querystring.parse does not produce an iterable object
    // https://nodejs.org/api/querystring.html#querystring_querystring_parse_str_sep_eq_options
    return parseQS(body.toString());
  }

  if (type === 'text/plain') {
    return body.toString();
  }

  return undefined;
};

function parseQuery({ url = '/' }: NowRequest): NowRequestQuery {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { parse: parseURL } = require('url');
  return parseURL(url, true).query;
};

function parseCookies(req: NowRequest): NowRequestCookies {
  const header: undefined | string | string[] = req.headers.cookie;

  if (!header) {
    return {};
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { parse } = require('cookie');
  return parse(Array.isArray(header) ? header.join(';') : header);
};

function status(res: NowResponse, statusCode: number): NowResponse {
  res.statusCode = statusCode;
  return res;
}

function redirect(
  res: NowResponse,
  statusOrUrl: string | number,
  url?: string
): NowResponse {
  if (typeof statusOrUrl === 'string') {
    url = statusOrUrl;
    statusOrUrl = 307;
  }
  if (typeof statusOrUrl !== 'number' || typeof url !== 'string') {
    throw new Error(
      `Invalid redirect arguments. Please use a single argument URL, e.g. res.redirect('/destination') or use a status code and URL, e.g. res.redirect(307, '/destination').`
    );
  }
  res.writeHead(statusOrUrl, { Location: url }).end();
  return res;
}

function setCharset(type: string, charset: string) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { parse, format } = require('content-type');
  const parsed = parse(type);
  parsed.parameters.charset = charset;
  return format(parsed);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function send(req: NowRequest, res: NowResponse, body: any): NowResponse {
  let chunk: unknown = body;
  let encoding: 'utf8' | undefined;

  switch (typeof chunk) {
    // string defaulting to html
    case 'string':
      if (!res.getHeader('content-type')) {
        res.setHeader('content-type', 'text/html');
      }
      break;
    case 'boolean':
    case 'number':
    case 'object':
      if (chunk === null) {
        chunk = '';
      } else if (Buffer.isBuffer(chunk)) {
        if (!res.getHeader('content-type')) {
          res.setHeader('content-type', 'application/octet-stream');
        }
      } else {
        return json(req, res, chunk);
      }
      break;
  }

  // write strings in utf-8
  if (typeof chunk === 'string') {
    encoding = 'utf8';

    // reflect this in content-type
    const type = res.getHeader('content-type');
    if (typeof type === 'string') {
      res.setHeader('content-type', setCharset(type, 'utf-8'));
    }
  }

  // populate Content-Length
  let len: number | undefined;
  if (chunk !== undefined) {
    if (Buffer.isBuffer(chunk)) {
      // get length of Buffer
      len = chunk.length;
    } else if (typeof chunk === 'string') {
      if (chunk.length < 1000) {
        // just calculate length small chunk
        len = Buffer.byteLength(chunk, encoding);
      } else {
        // convert chunk to Buffer and calculate
        const buf = Buffer.from(chunk, encoding);
        len = buf.length;
        chunk = buf;
        encoding = undefined;
      }
    } else {
      throw new Error(
        '`body` is not a valid string, object, boolean, number, Stream, or Buffer'
      );
    }

    if (len !== undefined) {
      res.setHeader('content-length', len);
    }
  }

  // strip irrelevant headers
  if (204 === res.statusCode || 304 === res.statusCode) {
    res.removeHeader('Content-Type');
    res.removeHeader('Content-Length');
    res.removeHeader('Transfer-Encoding');
    chunk = '';
  }

  if (req.method === 'HEAD') {
    // skip body for HEAD
    res.end();
  } else if (encoding) {
    // respond with encoding
    res.end(chunk, encoding);
  } else {
    // respond without encoding
    res.end(chunk);
  }

  return res;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function json(req: NowRequest, res: NowResponse, jsonBody: any): NowResponse {
  const body = JSON.stringify(jsonBody);

  // content-type
  if (!res.getHeader('content-type')) {
    res.setHeader('content-type', 'application/json; charset=utf-8');
  }

  return send(req, res, body);
}

/** @internal */
export class ApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

/** @internal */
export function sendError(
  res: NowResponse,
  statusCode: number,
  message: string
) {
  res.statusCode = statusCode;
  res.statusMessage = message;
  res.end();
}

/** @internal */
export function createServerWithHelpers(
  handler: (req: NowRequest, res: NowResponse) => void | Promise<void>
) {
  const lambda = async (_req: IncomingMessage, _res: ServerResponse) => {
    const req = _req as NowRequest;
    const res = _res as NowResponse;
    try {
      req.cookies = parseCookies(req);
      req.query = parseQuery(req);
      req.body = await parseBody(req);

      res.status = statusCode => status(res, statusCode);
      res.redirect = (statusOrUrl, url) => redirect(res, statusOrUrl, url);
      res.send = body => send(req, res, body);
      res.json = jsonBody => json(req, res, jsonBody);

      await handler(req, res);
    } catch (err) {
      if (err instanceof ApiError)
        return sendError(res, err.statusCode, err.message);

      throw err;
    }
  };

  return createServer(lambda);
}
