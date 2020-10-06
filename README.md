<br />
<p align="center">
  <!-- <img src="docs/logo.png" alt="Logo" width="250" height="250"> -->

  <h1 align="center">
    <em>μm</em>
  </h1>
  <h3 align="center">micron</h3>

  <p align="center">

> A micro http framework that sits neatly on top of @vercel/now for creating hyper-expresive lambdas.

Vercel is nice, but writing production-ready lambda services can require quite a bit of boilerplate. __micron__ is here to help improve that experienceby providing powerful helpers that allow you to create expressive and composable lambdas.
  </p>
</p>

<br/>
<br/>
<br/>

## Usage
**BEFORE MICRON**
```ts
import checkAuth from './checkAuth';

export default function(req: NowRequest, res: NowResponse) {
  try {
    if (!req.method.toUpperCase().equals('POST'))
      return res.status(404).send('Not Found');

    const auth = checkAuth(req.headers['Authorization']);
    if (!auth.isValid) return res.status(401).send('Unauthorized');

    console.log('Logged in with', auth.user);
    return res.status(200).json({
      success: true,
      user: auth.user,
      body: req.body
    });
  } catch(err) {
    return res.status(500).json({ success: false})
  }
}
```
**WITH MICRON**
```js
import { createLambda, post } from '@yotie/micron';
import authMiddleWare from './auth';

export default createLambda(
  post(({ req, body, ok, error }) => {
      const { user } = req.auth;
      console.log('Logged in with', user);

      return ok({ success: true, body, user });
  }),
  { middlewares: [authMiddleWare, ...moreMiddleWare]}
);
```

## Getting Started

Install the package
```sh
$ yarn add @yotie/micron
```

Create a simple lambda
```js
import { micron } from '@yotie/micron';

export default micron(({ ok }: MicronParams) => {
  return ok({ success: true, hello: 'world' });
});
```


## API

### MicronParams
Vercel provides a [useful list of helpers](https://vercel.com/docs/runtimes#official-runtimes/node-js/node-js-request-and-response-objects/node-js-helpers) inside of the Request and Response objects passed to the lambda. We've enhanced the experience a bit more by including an additional set of helpers and making it accessible via the `MicronParams` which is passed on to your functions.


|property|type|decription|
|------|----|----------|
|req | `NowRequest` | The incoming Request object |
|res | `NowResponse` | The outgoing Response object|
|body | `NowRequestBody` | An object containing the body sent by the request|
|cookies | `NowRequestCookies` | An object containing the cookies sent by the request|
|query | `NowRequestQuery` | An object containing the request's query string|
|ok | `ResponseHelper` | Returns a __200__ HTTP response with your payload|
|badRequest | `ResponseHelper`| Returns a __400__ HTTP response with your payload|
|unauthorized| `ResponseHelper`| Returns a __401__ HTTP response with your payload|
|notFound |`ResponseHelper`|  Returns a __404__ HTTP response with your payload|
|error| `ResponseHelper`| Returns a __500__ HTTP response with your payload|

<br/>
<br/>

The different `ResponseHelpers` are simple functions that allow you to return a ServerResponse with a preconfigured http status code. Leveraging these functions help enhance the readability and maintainability of your serverless projects by cutting down on some of the bloat. Instead of doing...
```js
return res.status(500).json({ message: 'Catastrophic Failure' });
```
...you can simplify your code to this:
```js
return error({ message: 'Catastrophic Failure' });
```

These functions accept `String, Array, Object, Buffer` as valid inputs which will become the response body.


## Micron Helpers

### micron
### get
### post
### put
### del
### match

```js
import { get, post, match } from '@yotie/micron';

export default match({
  post(async ({ body, ok, error}) {
    const user = await createUser(body);
    return ok(user);
  }),
  get(async ({query, ok, notFound}) {
    const user = await getUser(query.id);
    if(!user?.id) return notFound();

    return ok(user);
  })
})
```



## createLambda

```
createLambda(
  lambda: NowLambda,
  {
    cors: CorsOptions,
    middlewares: MicronMiddleware[]
  }

)
```

```js
import { createLambda, post } from '@yotie/micron';
import authMiddleWare from './auth';

export default createLambda(
  post(({ req, body, ok, error }) => {
    const { user } = req.auth;
    return ok({ success: true, body, user });
  }),
  { middlewares: [authMiddleWare]}
);
```


## Middlewares
Middleware functions are functions that have access to the request object (req) and the response object (res) to perform some task before the main lambda executes.

- Execute any code.
- Make changes to the request and the response objects.
- End the request-response cycle, example: `return badRequest();`

> Note: Middlewares must have the following signature `fn => (req, res) => fn(req, res)`

```js
import { createLambda } from '@yotie/micron'
import authMiddleWare from './auth'

const bodyLogger = lambda => {
  return (req, res) => {
    console.log('Incoming payload', req.body);
    return lambda(req, res);
  }
}

export default createLambda(
  get(({ ok}) => ok({ success: true })),
  { middlewares: [authMiddleWare, bodyLogger] }
);
```

You can also use micron to build out your middlewares.

```js
//auth.js

import { micron, NowLambda } from '@yotie/micron';
import { isValid } from './_utils';

const auth = (lambda: NowLambda) => {
  return micron({ req, res, body, unauthorized } => {
    const token = req.headers['Authorization'];

    if (!isValid(token)) return unautorized();

    console.log('User is allowed to access this lambda');
    return lambda(req, res);
  });
}

```

## CORS

CorsOptions
|Parameter| type | default | Description|
|---------|------|---------|------------|
|origin| `string` | * | |
|maxAge| `Number` | 86400 | |
|allowMethods | `string[]` | [GET, PUT, POST, PATCH, DELETE, OPTIONS] | |
|allowHeaders| `string[]`| [ X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept]| |
|allowCredentials | `Boolean` | true | |
|exposeHeaders| `string[]`| []| |

> Note: the origin can support multiple domains being set as well as glob patters



## Testing

```js
import { micron, mockLambda } from '@yotie/micron';

test('Successful api behaviour scenario', async () => {
  const lambda = micron(({ ok }) => ok({ success: true }));
  const { fetch } = await mockLambda(lambda);

  const res = await fetch();
  const { success } = await res.json();

  expect(res.ok).toBe(true);
  expect(success).toBe(true);
});
```



## TODO
- [ ] Create banner
- [ ] Documentation
  - [x] Improve intro and Getting started ✅
  - [x] Complete list of helpers from MicronParams ✅
  - [ ] MicronHelpers and their scenarios 🚧
    - [ ] `micron`
    - [ ] `get`
    - [ ] `put`
    - [ ] `post`
    - [ ] `del`
    - [ ] `match`
  - [ ] Document createLambda and use cases
  - [ ]  CORS and networking configuration
  - [ ]  Middlewares
    - [ ]  flexibility of our middleware pattern
  - [ ]  Testing and Mocking
  - [ ]  Contributing
- [ ] Test more negative cases
- [ ] Split project into monorepo
  - [ ] micron
  - [ ] micron-mock

# Authors
- Ashley Narcisse @darkfadr
- Kennet Postigo @kennetpostigo
