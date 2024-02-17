import { LoaderFunction } from '@remix-run/node';
import { eventStream } from 'remix-utils/sse/server';
// import { interval } from 'remix-utils/timers';

import { getUser, updateScore } from '~/db/guess.server';

const sleep = (sec: number) =>
  new Promise((resolve) => setTimeout(resolve, sec * 1000));

export const loader: LoaderFunction = ({ request, params }) => {
  const userId = params.userId;

  if (!userId) {
    return {};
  }

  return eventStream(request.signal, (send, close) => {
    let initialWait = true;

    const interval = setInterval(async () => {
      if (initialWait) {
        initialWait = false;
        await sleep(5);
      }

      const current = await fetch(
        'https://api.coincap.io/v2/rates/bitcoin',
      ).then((res) => res.json());

      const currentPrice = current.data.rateUsd;

      const user = await getUser(userId);

      if (!user || user.guess === 'idle' || !user.lastPrice) {
        return;
      }

      try {
        if (user.lastPrice === currentPrice) {
          return;
        }
        const guessResult =
          Number(currentPrice) > Number(user.lastPrice) ? 'up' : 'down';
        await updateScore(userId, guessResult === user.guess ? 1 : 0);

        const result = {
          currentPrice,
          guess: user.guess,
          lastPrice: user.lastPrice,
          guessResult,
        };
        send({
          event: `result`,
          data: JSON.stringify(result),
        });
      } catch (e) {
        if (e instanceof TypeError) {
          close();
        }
      }
    }, 500);

    return () => {
      initialWait = true;
      clearInterval(interval);
    };
  });
};
