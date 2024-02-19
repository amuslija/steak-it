import { LoaderFunction } from '@remix-run/node';
import { eventStream } from 'remix-utils/sse/server';

import { getUser, updateScore } from '~/db/guess.server';

export const loader: LoaderFunction = ({ request, params }) => {
  const userId = params.userId;

  if (!userId) {
    return {};
  }

  return eventStream(request.signal, (send, close) => {
    let coreTimeout: NodeJS.Timeout;

    const coreLoop = async () => {
      console.log('in');
      const current = await fetch(
        'https://api.coincap.io/v2/rates/bitcoin',
      ).then((res) => res.json());

      const currentPrice = current.data.rateUsd;

      const user = await getUser(userId);

      if (!user || user.guess === 'idle' || !user.lastPrice) {
        coreTimeout = setTimeout(coreLoop, 1000);
        return;
      }

      try {
        if (user.lastPrice === currentPrice) {
          setTimeout(coreLoop, 1000);
          return;
        }

        const guessResult =
          Number(currentPrice) > Number(user.lastPrice) ? 'up' : 'down';
        await updateScore(userId, guessResult === user.guess ? 1 : 0);
        console.log('guessResult', guessResult);
        const result = {
          currentPrice,
          guess: user.guess,
          lastPrice: user.lastPrice,
          diff: Math.abs(Number(currentPrice) - Number(user.lastPrice)),
          guessResult,
        };
        send({
          event: `result`,
          data: JSON.stringify(result),
        });
      } catch (e) {
        if (e instanceof TypeError) {
          close();
        } else {
          throw e;
        }
      }
    };

    const initialTimeout = setTimeout(() => {
      coreLoop();
    }, 60000);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(coreTimeout);
    };
  });
};
