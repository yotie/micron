const { send, json, text } = require("micro");
const { broccoli } = require("@yotie/utils");

const parseBody = async req => {
  if (!req.body) req.body = '{}';
  if (typeof req.body === 'object') return req.body;

  try { return json(req) }
  catch (error) { console.warn('👀 An error occured while parsing the request body to JSON.')}

  return text(req, {limit: '10mb', encoding: 'utf-8' });
}

const routeHandler = fn => async (req, res) => {
  try {
    const body = ["PUT", "POST", "PATCH"].includes(req.method) && await parseBody(req);
    const ok = data => send(res, 200, data);
    const badRequest = msg => send(res, 400, msg);
    const unauthorized = msg => send(res, 401, msg);
    const notFound = msg => send(res, 404, msg);
    const error = err => send(res, 500, err);
    const brok = data => {
      res.setHeader("Content-Encoding", "br");
      return ok(Buffer.from(broccoli.compress(data), "base64"));
    };
    const redirect = url => {
      if (!url) throw new Error('A URL is required in order to perform a redirect');

      res.setHeader('Location', url);
      return send(res, 302);
    };

    return fn({
      req,
      res,
      body,
      ok,
      brok,
      badRequest,
      unauthorized,
      notFound,

      redirect,
      error
    });
  } catch (err) {
    console.error("❌[MICRON] UNCAUGHT ERROR!!!!", err);
    return error(err);
  }
};

const isValidMethod = (method = "") =>
  ["GET", "PUT", "POST", "PATCH", "DELETE"].includes(method.toUpperCase());

const routeType = method => fn =>
  routeHandler(params => {
    const { req, notFound, error } = params;
    if (!isValidMethod(method))
      return error({ msg: "Unsupported HTTP method" });

    return (req.method === method && fn(params)) || notFound();
  });

const get = routeType("GET");
const put = routeType("PUT");
const post = routeType("POST");
const patch = routeType("PATCH");
const del = routeType("DELETE");

module.exports = { routeHandler, get, put, post, patch, delete: del };
