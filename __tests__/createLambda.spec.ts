import { createLambda, get, micron, mockLambda, NowLambda, MicronParams, MicronLambda } from '../src'

const okLambda: MicronLambda = ({ req, body, ok }) =>
  ok({ success: true, msg: 'Test Passed', method: req.method, body });

describe('createLambda', () => {
  it('should ', async () => {

    const testMiddleware = (fn: NowLambda) =>
      micron(({req, res}) => {
        req.test = 'injected';
        return fn(req, res);
      });

    const lambda = createLambda(
      get(({ req, ok }) => {
        return ok({ success: true, middleware: req.test })
      }),
      { middlewares: [testMiddleware] }
    );
    const { fetch } = await mockLambda(lambda);

    const res = await fetch();
    const { success, middleware } = await res.json();

    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
    expect(success).toBe(true);
    expect(middleware).toBe('injected');
  });
});
