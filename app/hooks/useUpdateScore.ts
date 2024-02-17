import { useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { useEventSource } from 'remix-utils/sse/react';

export type GuessResult = {
  currentPrice: string;
  guess: string;
  lastPrice: string;
  guessResult: string;
};

export const useUpdateScore = <T extends { userId: string }>(
  onEvent?: (score: GuessResult) => void,
) => {
  const loaderData = useLoaderData<T>();
  const data = useEventSource(`/emitter/${loaderData.userId}`, {
    event: 'result',
  });
  const [score, setUpdateScore] = useState<GuessResult | null>(null);
  const [guessState, setGuessState] = useState<'guessing' | 'done'>('guessing');

  useEffect(() => {
    if (!data) {
      return;
    }

    const result: GuessResult = JSON.parse(data);
    setGuessState('done');
    setUpdateScore(result);
    onEvent?.(result);
  }, [data, onEvent]);

  return { score, guessState };
};
