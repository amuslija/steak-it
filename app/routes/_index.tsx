import type { MetaFunction } from '@remix-run/node';
import {
  EventSourceMap,
  EventSourceProvider,
  useEventSource,
} from 'remix-utils/sse/react';

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

type ScoreData = {
  data: {
    id: string;
    symbol: string;
    currencySymbol: string;
    type: string;
    rateUsd: string;
  };
  timestamp: number;
};

const Score = () => {
  const data = useEventSource('/emitter', { event: 'time' });

  if (!data) {
    return null;
  }

  const score = JSON.parse(data) as ScoreData;

  return <div>{score.data.rateUsd}</div>;
};

const map: EventSourceMap = new Map();

export default function Index() {
  return (
    <EventSourceProvider value={map}>
      <div>
        <h1>🥩 Steak it:</h1>
        <p>
          Guess the price of Bitcoin and win a steak! The highest weekly score
          gets a free steak.
        </p>
        <Score />
      </div>
    </EventSourceProvider>
  );
}
