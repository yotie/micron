# micron
A small wrapper around `micro` that enhances the DevEx and flexibility of describing our lambda functions.


## Usage
### GET
```js
const { get } = require('@yotieapp/micron');

module.exports = get(({ ok }) => {
  ...some API logic
  return ok({ success: true });
});
```


## POST
> Note: If a get request is made to the following lambda, then a `404: notFound` will be returned
```js
const { post } = require('@yotieapp/micron');

module.exports = post(({ body, ok }) => {
  const { id } = body;
  ...some API logic to save id
  return ok({ success: true, data: { id } });
});
```


## Desciption
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
