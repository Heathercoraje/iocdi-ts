import 'reflect-metadata';
import { InjectableRef } from '../injectable-ref';
import keys from '../decorators/keys';


type TConstructor<T> = new (...args: any[]) => T;

type TRef<T> = InjectableRef | TConstructor<T>;

type TSource<T> = TConstructor<T> | T;


/* Dependencies */

interface IClassDependency<T> {
  ref: TRef<T>;
  source: TConstructor<T>;
  type: 'class';
}

interface IParamDependency<T> {
  ref: TRef<T>;
  source: T;
  type: 'param';
}

type TDependency<T = any> = IClassDependency<T> | IParamDependency<T>;


export class Container {
  private registrar = new Map<TRef<any>, TDependency>();

  private register = <T>(dependency: TDependency<T>) => {
    this.registrar.set(dependency.ref, dependency);
  };

  private construct<T>(target: TRef<T>): T {
    let registeringDependency = this.registrar.get(target);
    if (
      registeringDependency === undefined &&
      !(target instanceof InjectableRef)
    ) {
      registeringDependency = {
        ref: target,
        source: target as TConstructor<T>,
        type: 'class'
      };
    }
    return this.injectDependency(registeringDependency);
  }

  private injectDependency<T>(dependency?: TDependency<T>): T {
    if (dependency === undefined) {
      throw new Error(`Dependency missing`);
    }
    if (dependency.type === 'class') {
      const source = dependency.source;
      const params = this.getParams(source);
      return Reflect.construct(source, params);
    } else {
      return dependency.source;
    }
  }

  private getParams<T>(target: TConstructor<T>) {
    const params = Reflect.getMetadata('design:paramtypes', target) || [];
    return params.filter(Boolean).map((param: InjectableRef, index: number) => {
      const ref =
        Reflect.getMetadata(keys.INJECT, target, String(index)) || param;
      const dependency = this.registrar.get(ref);
      return this.injectDependency(dependency as TDependency<T>);
    });
  }

  public inject = <T>(dependency: TDependency<T>) => {
    this.register(dependency);
    return this;
  };

  public add = <T>(dependency: TDependency<T>) => {

    if (this.registrar.size === 0) {
      throw new Error('You need to call inject first');
    }
    return this.inject(dependency);
  };

  public into = <T>(target: TRef<T>) => {
    if (this.registrar.get(target)) {
      throw new Error("injected dependency")
    }
    return this.construct(target);
  };
}

