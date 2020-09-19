import path from 'path';
import { RequestListener, ServerResponse } from 'http';
import listen from 'test-listen';
import fetch, { RequestInit, Response } from 'node-fetch';
import { createServerWithHelpers } from './helpers';

type MockLambda = {
  url: string,
  fetch(_path?: string | RequestInit, opts?: RequestInit): Promise<Response>,
  shutdown: Function,
}

export const mockLambda = async (fn: RequestListener): Promise<MockLambda> => {
  const server = createServerWithHelpers(fn);

  server.on('request', (_, res: ServerResponse) =>
    res.on('finish', () => server.close()));

  const url = await listen(server);
  const shutdown = () => server.close();

  const call = (_path?: string | RequestInit, opts?: RequestInit): Promise<Response> => {
    if (typeof path === 'object') {
      opts = _path as RequestInit;
      _path = '';
    }

    const uri = path.join(url, _path as string || '').replace(':/','://');
    return fetch(uri, {
      ...opts,
      headers: {
        ...opts?.headers,
        'Content-Type': 'application/json'
      }
    });
  }

  return { fetch: call, shutdown, url };
}
