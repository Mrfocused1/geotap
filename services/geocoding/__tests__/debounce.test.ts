import { debounceAsync } from '@/services/geocoding/debounce';

jest.useFakeTimers();

describe('debounceAsync', () => {
  it('only invokes the wrapped fn once per quiet window', async () => {
    const fn = jest.fn(async (n: number) => n * 2);
    const { call } = debounceAsync(fn, 100);

    const p1 = call(1);
    const p2 = call(2);
    const p3 = call(3);

    jest.advanceTimersByTime(100);
    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);
    expect(r1).toBe(6);
    expect(r2).toBe(6);
    expect(r3).toBe(6);
  });

  it('cancel() prevents pending invocation', () => {
    const fn = jest.fn(async () => 'x');
    const { call, cancel } = debounceAsync(fn, 100);
    void call();
    cancel();
    jest.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
  });
});
