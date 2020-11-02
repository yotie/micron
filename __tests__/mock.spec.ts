import { Lambda, mockLambda as mock } from '../src';

describe('mock', () => {
  it('should successfully execute a lamda', async () => {
    const lambda: Lambda = (_, res) =>
      res.status(200).json({ success: true});

    const { fetch } = await mock(lambda);

    const resp = await fetch();
    // const { success } = await resp.json();

    expect(resp.ok).toBe(true);
    // expect(success).toBe(true);
  });

  it('should successfully handle a failure lambda', async () => {
    const lambda: Lambda = (_, res) =>
      res.status(500).json({ success: false });

    const { fetch } = await mock(lambda);

    const resp = await fetch();
    const { success } = await resp.json();

    expect(resp.ok).toBe(false);
    expect(success).toBe(false);
  });

  // //TODO: complete test for unhandled exceptions
  // it('should throw unahndled exception', async () => {

  //   const act = async () => {
  //     const lambda: Lambda = (_, res) => {
  //       throw new Error('Fatal Error');
  //     };
  //     const { fetch } = await mock(lambda);
  //     fetch();
  //   };

  //   expect(act).toThrow();
  // });


  it('should receive payload from POST request', async () => {
    const lambda: Lambda = (req, res) => {
      const data = req.body;
      return res.status(200).json({ success: true, data });
    }

    const { fetch, shutdown } = await mock(lambda);
    const resp = await fetch({
      method: 'post',
      body: JSON.stringify({ post: 'success' })
    });

    const { success, data } = await resp.json();

    expect(resp.ok).toBe(true);
    expect(success).toBe(true);
    expect(data.post).toBe('success');
  });

  it('should extract query data from url', () => {

  });
});
