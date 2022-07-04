import 'reflect-metadata';
import { Injectable, Inject } from '.';
import keys from './keys';

describe('decorators', () => {
  @Injectable()
  class ExampleClass { }

  describe('Injectable', () => {
    it('defines meta data with a selected key', () => {
      const value = Reflect.getMetadata(keys.INJECTABLE, ExampleClass)
      expect(value).toBe(true);
    });
  });


  describe('Inject', () => {
    it('defines meta data on param with selected key', () => {
      Reflect.defineMetadata = jest.fn();
      const inject = Inject('some-ref');
      const target = { param: 'value' };
      inject(target, 'param', 0);
      expect(Reflect.defineMetadata).toHaveBeenCalledWith(
        keys.INJECT,
        'some-ref',
        { param: 'value' },
        '0'
      );
    });
  });
});