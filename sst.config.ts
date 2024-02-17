import type { SSTConfig } from 'sst';
import { RemixSite, StackContext, Table, use } from 'sst/constructs';

const DB = ({ stack }: StackContext) => {
  const guessesTable = new Table(stack, 'GuessesTable', {
    fields: {
      userId: 'string',
      guess: 'string',
      score: 'number',
      lastPrice: 'string',
    },
    primaryIndex: { partitionKey: 'userId' },
  });

  return guessesTable;
};

const Site = ({ stack }: StackContext) => {
  const DBStack = use(DB);
  const site = new RemixSite(stack, 'SteakItSite', {
    bind: [DBStack],
  });
  stack.addOutputs({
    url: site.url,
  });

  return site;
};

export default {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  config(_input) {
    return {
      name: 'steak-it',
      region: 'eu-central-1',
    };
  },
  stacks(app) {
    app.stack(DB).stack(Site);
  },
} satisfies SSTConfig;
