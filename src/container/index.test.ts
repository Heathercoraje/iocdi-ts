import { Container } from '.';
import { Injectable, Inject } from '../decorators';
import { InjectableRef } from '../injectable-ref';

const LogFileRef = new InjectableRef('LOG_FILE_REF');
const ErrorFileRef = new InjectableRef('ERROR_FILE_REF');

class Logger {
  public log(...args: any[]) {
    console.log('[log]', ...args);
  }
}

@Injectable()
class MyLogger {
  constructor(@Inject(LogFileRef) public logFileRef: string) { }
  public log(...args: any[]) {
    console.log('[my-log]', ...args);
  }
}

@Injectable()
class MyOtherLogger {
  constructor(
    @Inject(LogFileRef) public logFileRef: string,
    @Inject(ErrorFileRef) public errorFileRef?: undefined | string
  ) { }
  public log(...args: any[]) {
    console.log('[my-log]', ...args);
  }
  public error(...args: any[]) {
    console.error('[my-error]', ...args);
  }
}

@Injectable()
class ApiService {
  constructor(private readonly logger: Logger) {
    this.logger.log('ApiService initialized');
  }
  async getName() {
    return { id: '1', name: 'Donut Lee' };
  }
}

@Injectable()
class CustomorService {
  constructor(private readonly api: ApiService) { }
  async getCustomer() {
    return await this.api.getName();
  }
}


describe('Container', () => {
  console.log = jest.fn();

  class AnotherLogger {
    public log(...args: any[]) {
      console.log('[another-log]', ...args);
    }
  }

  afterEach(() => {
    (console.log as any).mockClear();
  });

  it('injects Logger into ApiService', () => {
    const container = new Container();
    container
      .inject({ ref: Logger, source: Logger, type: 'class' })
      .into(ApiService);

    Reflect.get
    expect(console.log).toHaveBeenCalledWith('[log]', 'ApiService initialized');
  });

  it('can replace dependency for another dependency of the same type', () => {
    const container = new Container();
    container
      .inject({ ref: Logger, source: AnotherLogger, type: 'class' })
      .into(ApiService);
    expect(console.log).toHaveBeenCalledWith(
      '[another-log]',
      'ApiService initialized'
    );
  });

  it('can recursively inject class dependencies', async () => {
    const container = new Container();
    const customerService = container
      .inject({ ref: Logger, source: Logger, type: 'class' })
      .add({ ref: ApiService, source: ApiService, type: 'class' })
      .into(CustomorService);
    expect(await customerService.getCustomer()).toEqual({
      id: '1',
      name: 'Donut Lee'
    });
  });

  it('injects a param into an injectable class', () => {
    const container = new Container();
    const myLogger = container
      .inject({ ref: LogFileRef, source: 'log.txt', type: 'param' })
      .into(MyLogger);

    expect(myLogger.logFileRef).toEqual('log.txt');
  });

  it('throws an error if an expected dependency is missing', () => {
    const container = new Container();

    expect(() => {
      container
        .inject({ ref: ErrorFileRef, source: 'error.txt', type: 'param' })
        .into(MyOtherLogger);
    }).toThrowError('Dependency missing');
  });


  it('inject more than one param into an injectable class', () => {
    const container = new Container();

    const myLogger = container
      .inject({ ref: LogFileRef, source: 'log.txt', type: 'param' })
      .add({
        ref: ErrorFileRef,
        source: 'error.txt',
        type: 'param'
      })
      .into(MyOtherLogger);

    expect(myLogger.logFileRef).toEqual('log.txt');
    expect(myLogger.errorFileRef).toEqual('error.txt');
  });
});