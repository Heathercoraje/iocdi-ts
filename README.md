# iocdi-ts
A simple IoC library in Typescript using Dependency injection pattern


## Install
Using npm:

$ npm install iocdi-ts


## Container API
Container will handle dependencies by injecting dependencies you want and also providing decorators.

Using `inject(dependency), add(dependency), into(main class)`, you will initialise a class with dependencies you want. 

## Example

Let's take a example of a `FruitPriceService` that connects to API to get a price of fruit across the world. `FruitPriceService` depends on a basic logger and `ApiService`. We can initialise `FruitPriceService` with those dependencies by using container's api. 

```
import { Container, Injectable, Inject, InjectableRef } from 'iocdi-ts

const container = new Container();

const class Logger {
  public log(...args: any[]) {
    console.log("[log]", ...args);
  }
}


@Injectable()
class ApiService {
  constructor(
    @Inject(URL) private url: string,
    private logger: Logger
  ) {
    this.logger.log("ApiService initialized");
  }

  async getData(endpoint: string) {
    const response = await fetch(`${this.url}/${endpoint}`);
    return await response.json();
  }
}

@Injectable()
class FruitPriceService {
  constructor(
    private readonly api: ApiService,
    private readonly logger: Logger
  ) {
    this.logger.log("Launching  FruitPriceService");
  }
  async getPrice(fruit: string, country: string, symbol: string) {
    return await this.api.getData(
      `latest?fruit=${fruit}&country=${country}&symbol=${symbol)}`
    );
  }
}


const fruitPrice  = container
  .inject({ref: Logger, source: Logger, type: 'class'})
  .add({ref: URL, source: 'https://api.fruitworld.io, type: 'param' })
  .and({ref: ApiService, source: ApiService, type: 'class'})
  .into(FruitPriceService)


const AvocadoPrice = fruitPrice.getPrice('avocado','mexico', 'USD');

console.log(AvocadoPrice)
/* logs $30 */

```

## Troubleshoot

1. `.add(anotherDependency)` will expect to be called once `inject(dependency)` is called.

For exmaple, when initialising a container instance, this will throw an error. 

```


const container = new Container();

class FruitPriceService {
  constructor(
    private readonly api: ApiService,
    private readonly logger: Logger
  ) {
    this.logger.log("Launching  FruitPriceService");
  }
  async getPrice(fruit: string, country: string, symbol: string) {
    return await this.api.getData(
      `latest?fruit=${fruit}&country=${country}&symbol=${symbol)}`
    );
  }
}

const myService = container. 
        .inject({ref: Logger, source: Logger, type: 'class'})
        .into(FruitPriceService);
    })

/* Initialising service this way will throw error 'Dependency missing' because `FruitPriceService` is expecting Api service to be injected before we call `.into(FruitPriceService)`  */
```

To avoid, make sure you are registering all dependencies you agreed to inject. 

```

const myService  = container
  .inject({ref: Logger, source: Logger, type: 'class'})
  .add({ref: URL, source: 'https://api.fruitworld.io, type: 'param' })
  .and({ref: ApiService, source: ApiService, type: 'class'})
  .into(FruitPriceService)


```