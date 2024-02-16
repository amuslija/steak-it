import type { SSTConfig } from 'sst';
import { RemixSite, StackContext, Table } from 'sst/constructs';

const DB = ({ stack }: StackContext) => {
  const guessesTable = new Table(stack, 'GuessesTable', {
    fields: {
      userId: 'string',
      score: 'number',
    },
    primaryIndex: { partitionKey: 'userId', sortKey: 'score' },
  });

  return guessesTable;
};

const Site = ({ stack }: StackContext) => {
  const site = new RemixSite(stack, 'SteakItSite');
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
