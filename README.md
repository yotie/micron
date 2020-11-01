<br />
<p align="center">
  <img src="https://yotie.github.io/micron/assets/logo.svg" alt="Logo" style="margin-bottom: 50px">
  <br/>
  <em>A micro-framework for creating expressive and hyper-composable lambdas.</em>
<p/>

<br/><br/>

Writing production-ready lambda services can require quite a bit of boilerplate. __micron__ is here to help improve that experience by providing powerful helpers that allow you to create expressive and hyper-composable serverless functions. This was designed to work seamlessly on [Vercel](https://vercel.app).
  </p>
</p>

<br/>

## Getting Started

### Setup
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


### Example Usage with contrast
**BEFORE MICRON**
```ts
import checkAuth from './checkAuth';

export default function(req: Request, res: Response) {
  try {
    if (!req.method.toUpperCase().equals('POST'))
      return res.status(405).send('Method Unsupported');

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
> __micron__ improves the signal-to-noise ratio in your code which increases it readability, while reducing duplication and boilerplate.

<!-- ## Motivations
Talks about some of the boilerplate and noise that typically get injected into lambda serverless function. mention how we're leveraging currying and functional composition which allows us to cleanly issolate and re-use various portions of our code and easily extend the functionality of our lambdas.  In the process of doing so, we also substantially improve the readability of our services while desing our functionality into highly cohesive and loosely coupled lambdas. The ultimate goal behind micron is to build a library that can be used to the build serverless functions on any serverles provider.

While we currently support Vercel, our patterns should be compatible with AWS Lambda, Netlify, Firebase Functions, Toast<sup>beta</sup>, and many more.

<br/>

![diagram](docs/assets/diagram.png) -->

## API

### `Type: MicronParams`
Vercel provides a [useful list of helpers](https://vercel.com/docs/runtimes#official-runtimes/node-js/node-js-request-and-response-objects/node-js-helpers) inside of the Request and Response objects passed to the lambda. We've enhanced the experience a bit more by including an additional set of helpers, making it accessible via the `MicronParams` which is passed on to your functions. While leveraging __*micron*__, your serverless functions will change from the default method signature:
```js
(req: IncomingMessage, res: ServerResponse) => res: ServerResponse
```
to leveraging the `MicronLambda` function signature:
```js
(params: MicronParams) => res: ServerResponse
```



Here is a complete list of all the properties contained in the `MicronParams`:

|Property|Type|Decription|
|------|----|----------|
|req | `Request` | The incoming Request object |
|res | `Response` | The outgoing Response object|
|body | `RequestBody` | An object containing the body sent by the request|
|cookies | `RequestCookies` | An object containing the cookies sent by the request|
|query | `RequestQuery` | An object containing the request's query string|
|ok | `ResponseHelper` | Returns a __200__ HTTP response with your payload|
|brotli | `ResponseHelper` | Returns a __200__ HTTP response with your payload compressed in `br` encoding|
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

These functions accept `String, Array, Object, Buffer` as valid inputs which will be passed on as the response body.



### `micron(fn)`
The simplest way of creating a lambda is with the `micron` helper. This wraps your function in a global exception handler and will add light-weight request logging capabilites.

#### Usage
```js
export default micron(({ req, ok }: MicronParams) => {
  return ok({
    success: true,
    requestType: req.method
  });
});
```
> Note: lambdas created with the `micron` function accept requests from any HTTP method type. To restrict the HTTP method that your lambda allows, use one of the following: [get](#getfn), [post](#postfn), [put](#putfn), [patch](#patchfn), [del](#delfn)


### `get(fn)`
#### Usage
```js
import { get } from '@yotie/micron';

export default get(({ ok }) => {
  return ok({ success: true });
});
```


### `post(fn)`
#### Usage
```js
import { post } from '@yotie/micron';

export default post(({ body, ok }) => {
  return ok({ success: true, payload: body });
});
```


### `put(fn)`
#### Usage
```js
import { put } from '@yotie/micron';

export default put(({ ok }) => {
  return ok({ success: true });
});
```


### `patch(fn)`
#### Usage
```js
import { patch } from '@yotie/micron';

export default patch(({ ok }) => {
  return ok({ success: true });
});
```


### `del(fn)`
#### Usage
```js
import { del } from '@yotie/micron';

export default del(({ ok }) => {
  return ok({ success: true });
});
```

### `match({})`

#### Usage
```ts
import { get, post, match } from '@yotie/micron';

export default match({
  async post({ body, ok, error }) {
    const user = await createUser(body);
    return ok(user);
  },
  async get({ query, ok, notFound }) {
    const user = await getUser(query.id);
    if(!user?.id) return notFound();

    return ok(user);
  }
})
```



### `createLambda(fn, opts)`
#### Usage
```ts
import { get } from '@yotie/micron';
import { traceMiddleware, } from './middlewares';


export default createLambda(
  get(({ ok }) => {
    // some business logic here
    return ok({ success: true })
  }),
  {
    cors: { origin: 'https://example.com, http://localhost:3000' }
    middlewares: [traceMiddleware]
  }
);
```

#### __Parameters__
Name | Type | Default value |
------ | ------ | ------ |
`service` | NowLambda | - |
`opts` | LambdaOptions | see defaults for *LambdaOptions*|

<br/>


#### __LambdaOptions__
Name | Type | Default value |
------ | ------ | ------ |
`cors?` | CorsOptions | see defaults for *CorsOptions* |
`middlewares?` | [MicronMiddleware](../interfaces/_src_createlambda_.micronmiddleware.md)[] | [] |

<br/>

#### __CorsOptions__
|Parameter| type | default | Description|
|---------|------|---------|------------|
|origin| `string` | * | |
|maxAge| `Number` | 86400 | |
|allowMethods | `string[]` | [GET, PUT, POST, PATCH, DELETE, OPTIONS] | |
|allowHeaders| `string[]`| [ X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept]| |
|allowCredentials | `Boolean` | true | |
|exposeHeaders| `string[]`| []| |

> Note: the origin can support multiple domains being set as well as glob patters

---


## Middlewares
Middleware functions are functions that have access to the request object (req) and the response object (res) to perform some task before the main lambda executes.

- Execute any code.
- Make changes to the request and the response objects.
- End the request-response cycle, example: `return badRequest();`

> Note: Middlewares must have the following signature `fn => (req, res) => fn(req, res)`

### `createMiddleware(fn, next)`

#### Usage
```js
import { createMiddleware } from '@yotie/micron';

export const auth = createMiddleware(({ req, unauthorized }, next) => {
  const token = req.headers['Authorization'];
  if (!token) return unauthorized();

  req.auth = { user: 'exampleUser' }
  console.log('User is allowed to access this lambda');

  return next();
});
```


You can also use the micron helper to build out your middlewares w/o using the `createMiddleware` helper.

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

---

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
- [x] Create Logo ✅
- [x] Create banner ✅
- [ ] Documentation
  - [x] Improve intro and Getting started ✅
  - [ ] Motivation and design principles 🚧
  - [x] Complete list of helpers from MicronParams ✅
  - [ ] MicronHelpers and their scenarios 🚧
    - [x] `micron` ✅
    - [ ] `get` 🚧
    - [ ] `put` 🚧
    - [ ] `post` 🚧
    - [ ] `del` 🚧
    - [ ] `match` 🚧
  - [ ] Document createLambda and use cases 🚧
  - [x]  CORS and networking configuration✅
  - [ ]  Middlewares 🚧
    - [ ]  flexibility of our middleware pattern
  - [ ]  Testing and Mocking
    - [ ]  add query params serialization
  - [ ]  Contributing
- [ ] Test more negative cases
- [ ] Add file upload support
- [ ] Split project into monorepo
  - [ ] micron
  - [ ] micron-mock
  - [ ] micron-vercel
  - [ ] micron-netlify
  - [ ] micron-middleware-auth0
  - [ ] micron-middleware-magiclink

# Authors
- Ashley Narcisse @darkfadr
- Kennet Postigo @kennetpostigo
