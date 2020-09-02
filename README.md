<br />
<p align="center">
  <!-- <img src="docs/logo.png" alt="Logo" width="250" height="250"> -->

  <h1 align="center">
    <em>μm</em>
  </h1>
  <h3 align="center">micron</h3>

  <p align="center">

> A micro http framework that sits neatly on top of @vercel/now for creating hyper-expresive lambdas.

Vercel is nice, but writing production-ready lambda services can require quite a bit of boilerplate. __micron__ is here to help improve that experienceby providing powerful helpers that allow you to create expressive and extensible lambdas.
  </p>
</p>

## Usage
### GET
```js
const { get } = require('@yotie/micron');

module.exports = get(({ ok }) => {
  ...some API logic
  return ok({ success: true });
});
```

## Getting Started

```sh
$ yarn add @yotie/micron
```

```ts
export default function(req: NowRequest, res: NowResponse) {
  try {
    if (!req.method.toUpperCase().equals('POST'))
      return res.status(404).send('Not Fund');

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


```js
import { createLambda } from '@yotie/micron';
import authMiddleWare from './auth';

export default createLambda(
  post(({ req, body, ok, error}) => {
      const { user } = req.auth;
      console.log('Logged in with', user);

      return ok({ success: true, body, user });
  }),
  { middlewares: [authMiddleWare, ...moreMiddleWare]}
);
```


## API
The  `get(fn)` and `post(fn)` route functions accept a function argument that will get passed a `RouteArguments` object the schema can be seen in the following snippet.

```
RouteArguments
{
  req: RequestObject
  res: ResponseObject
  body: Object
  ...ResponseHelpers
}
```

The Route arguments also come included with a set of `ResponseHelpers` that provide usefult functions for controling the shape of your http responses.

|method|args|decription|
|------|----|----------|
|ok | `payload: [string,array,object]` | Returns a __200__ HTTP response with your payload|
|badRequest | `payload: [string,array,object]`| Returns a __400__ HTTP response with your payload|
|unauthorized| `payload: [string,array,object]`| Returns a __401__ HTTP response with your payload|
|notFound |`payload: [string,array,object]`|  Returns a __404__ HTTP response with your payload|
|error| `payload: [string,array,object]`| Returns a __500__ HTTP response with your payload|


<br/>
<br/>

### match

```js
import micron, { get, post, match } from '@yotie/micron';

export default micron(
  match({
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
)
```



### createLambda




### Middlewares


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

const auth = (lambda: NowLambda) => {
  return micron({req, res, body, unauthorized } => {
    const token = req.headers['Authorization'];

    if (!isValid(token)) return unautorized();

    console.log('User is allowed to access this lambda');

    return lambda(req, res);
  });
}

```

## TODO
- [ ] Create banner
- [ ] Documentation 🚧
  - [ ] Improve intro and Getting started
  - [ ] Complete list of helpers from MicronParams 🚧
  - [ ] MicronHelpers and their scenarios
    - [ ] `get`
    - [ ] `put`
    - [ ] `post`
    - [ ] `del`
    - [ ] `match`
  - [ ] Document createLambda and use cases
    - [ ]  cors and networking configuration
    - [ ]  middleware
  - [ ]  demonstrate the flexibility of our middleware pattern
  - [ ]  Testing and Mocking
  - [ ]  Contributing
- [ ] Test more negative cases
- [ ] Split project into monorepo

# Authors
- Ashley Narcisse @darkfadr
- Kennet Postigo
