import { micron, createLambda, createMiddleware, get, mockLambda, Lambda, MicronParams, MicronLambda } from '../src'

//baseline
const testMiddleware = (fn: Lambda) =>
  micron(({req, res}) => {
    //@ts-ignore
    req.test = 'injected';
    return fn(req, res);
  });

describe('createMiddleware', () => {
  it('should ', async () => {
      const auth = createMiddleware(({ req, unauthorized }, next) => {
        const token = req.headers['Authorization'];
        if (!token) return unauthorized();

        req.auth = { user: 'exampleUser' };
        console.log('User is allowed to access this lambda');
        return next();
      });

    const lambda = createLambda(
      get(({ req, ok }) => {
        //@ts-ignore
        return ok({
          success: true,
          middleware: req.test,
          user: req.auth.user
        });
      }),
      { middlewares: [testMiddleware, auth] }
    );
    const { fetch } = await mockLambda(lambda);
    const res = await fetch();

    expect(res.ok).toBe(false);
    expect(res.status).toBe(401);
  });

  it('should  pass', async () => {
      const auth = createMiddleware(({ req, unauthorized }, next) => {
        req.auth = { user: 'exampleUser' };
        console.log('User is allowed to access this lambda');
        return next();
      });

    const lambda = createLambda(
      get(({ req, ok }) => {
        //@ts-ignore
        return ok({
          success: true,
          middleware: req.test,
          user: req.auth.user
        });
      }),
      { middlewares: [testMiddleware, auth] }
    );
    const { fetch } = await mockLambda(lambda);

    const res = await fetch();
    const { success, middleware, user } = await res.json();

    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
    expect(success).toBe(true);
    expect(middleware).toBe('injected');
    expect(user).toBe('exampleUser');
  });
});
