import { micron, get, put, post, del, mockLambda, MicronLambda, match, } from '../src';


const okLambda: MicronLambda = ({ req, body, ok }) =>
  ok({ success: true, msg: 'Test Passed', method: req.method, body });

const failLambda: MicronLambda = ({ req, body, error }) =>
  error({ success: false, msg: 'Test Passed', method: req.method, body });


describe('micron', () => {
  describe('generic', () => {
    it('should successfully create and call genertic lambda', async () => {
      const lambda = micron(okLambda);
      const { fetch } = await mockLambda(lambda);

      const res = await fetch();
      const data = await res.json();

      expect(res.ok).toBe(true);
      expect(data.success).toBe(true);
    });

    it('should successfully create and get error from genertic error lambda', async () => {
      const lambda = micron(failLambda);
      const { fetch } = await mockLambda(lambda);

      const res = await fetch();
      const data = await res.json();

      expect(res.ok).toBe(false);
      expect(data.success).toBe(false);
    });

    it('should catch and handle uncaught exceptions', async () => {
      const lambda = micron((_) => {
        throw new Error('Fatal Error')
      });

      const { fetch } = await mockLambda(lambda);

      const res = await fetch();
      const { success, error } = await res.json();

      expect(res.ok).toBe(false);
      expect(res.status).toBe(500);
      expect(success).toBe(false);
      expect(error).toBe('Error: Fatal Error');
    });
  })

  describe('get', () => {
    it('should deny non GET requests to lambda', async () => {
      const lambda = get(okLambda);
      const { fetch } = await mockLambda(lambda);
      const res = await fetch({ method: 'put' });

      expect(res.ok).toBe(false);
      expect(res.status).toBe(404);
    });

    it('should successfully all GET requests to lambda', async () => {
      const lambda = get(okLambda);
      const { fetch } = await mockLambda(lambda);

      const res = await fetch();
      const { success } = await res.json();

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);
      expect(success).toBe(true);
    });
  });

  describe('put', () => {
    it('should deny non PUT requests to lambda', async () => {
      const lambda = put(okLambda);
      const { fetch } = await mockLambda(lambda);
      const res = await fetch();

      expect(res.ok).toBe(false);
      expect(res.status).toBe(404);
    });

    it('should successfully all PUT requests to lambda', async () => {
      const lambda = put(okLambda);
      const { fetch } = await mockLambda(lambda);

      const res = await fetch({ method: 'put' });
      const { success } = await res.json();

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);
      expect(success).toBe(true);
    });
  });

  describe('post', () => {
    it('should deny non POST requests to lambda', async () => {
      const lambda = post(okLambda);
      const { fetch } = await mockLambda(lambda);
      const res = await fetch({ method: 'put' });

      expect(res.ok).toBe(false);
      expect(res.status).toBe(404);
    });

    it('should successfully all POST requests to lambda', async () => {
      const lambda = post(okLambda);
      const { fetch } = await mockLambda(lambda);

      const res = await fetch({ method: 'post' });
      const { success } = await res.json();

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);
      expect(success).toBe(true);
    });
  });

  describe('patch', () => {
    it('should deny non POST requests to lambda', async () => {
      const lambda = post(okLambda);
      const { fetch } = await mockLambda(lambda);
      const res = await fetch({ method: 'put' });

      expect(res.ok).toBe(false);
      expect(res.status).toBe(404);
    });

    it('should successfully all POST requests to lambda', async () => {
      const lambda = post(okLambda);
      const { fetch } = await mockLambda(lambda);

      const res = await fetch({ method: 'post' });
      const { success } = await res.json();

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);
      expect(success).toBe(true);
    });
  });

  describe('delete', () => {
    it('should deny non POST requests to lambda', async () => {
      const lambda = del(okLambda);
      const { fetch } = await mockLambda(lambda);
      const res = await fetch({ method: 'put' });

      expect(res.ok).toBe(false);
      expect(res.status).toBe(404);
    });

    it('should successfully all POST requests to lambda', async () => {
      const lambda = del(okLambda);
      const { fetch } = await mockLambda(lambda);

      const res = await fetch({ method: 'delete' });
      const { success } = await res.json();

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);
      expect(success).toBe(true);
    });
  });

  describe('match', () => {
    it('should successfully route GET requests to the get lambda', async () => {
      const { fetch } = await mockLambda(
        match({
          get: get(okLambda),
          post: post(okLambda)
        })
      );

      const res = await fetch();
      const { success, method } = await res.json();

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);
      expect(success).toBe(true);
      expect(method).toBe('GET');
    });

    it('should successfully route POST requests to the get lambda', async () => {
      const { fetch } = await mockLambda(
        match({
          get: get(okLambda),
          post: post(okLambda)
        })
      );

      const res = await fetch({ method: 'post' });
      const { success, method } = await res.json();

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);
      expect(success).toBe(true);
      expect(method).toBe('POST');
    });

    it('should return 405 to missing/not configured lambda', async () => {
      const { fetch } = await mockLambda(
        match({
          get: get(okLambda),
          post: post(okLambda)
        })
      );

      const res = await fetch({ method: 'put' });

      expect(res.ok).toBe(false);
      expect(res.status).toBe(405);
    });
  });
});
