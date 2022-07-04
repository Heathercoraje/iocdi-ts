import { InjectableRef } from '.';

describe('InjectableRef', () => {
  it('initializes with public ref identifier', () => {
    const injectableRef = new InjectableRef('injectableRef');
    expect(injectableRef.ref).toEqual('injectableRef');
  });
});