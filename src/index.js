const {send, json} = require('micro');

const routeHandler = fn => (req, res) => {
  const ok = data => send(res, 200, data);
  const badRequest = msg => send(res, 400, msg);
  const unauthorized = msg => send(res, 401, msg);
  const notFound = msg => send(res, 404, msg);
  const error =  err => send(res, 500, err);
  const body = req.method === 'POST' && json(req) || {};

  try {
    return fn({req, res, body, ok, badRequest, unauthorized, notFound, error})
  } catch (err) {
    console.error('=======> UNCAUGHT ERROR!!!!', err);
    return error(err);
  }
};

module.exports = routeHandler;
