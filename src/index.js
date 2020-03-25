const { send, json } = require("micro");
const { broccoli } = require("@yotieapp/utils");

const routeHandler = fn => async (req, res) => {
  const ok = data => send(res, 200, data);
  const badRequest = msg => send(res, 400, msg);
  const unauthorized = msg => send(res, 401, msg);
  const notFound = msg => send(res, 404, msg);
  const error = err => send(res, 500, err);
  const brok = data => {
    res.setHeader("Content-Encoding", "br");
    return ok(Buffer.from(broccoli.compress(data), "base64"));
  };

  const body =
    (["PUT", "POST", "PATCH"].includes(req.method) && (await json(req))) || {};

  try {
    return fn({
      req,
      res,
      body,
      ok,
      brok,
      badRequest,
      unauthorized,
      notFound,
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
