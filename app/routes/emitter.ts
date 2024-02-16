import { LoaderFunction } from '@remix-run/node';
import { eventStream } from 'remix-utils/sse/server';
// import { interval } from 'remix-utils/timers';

export const loader: LoaderFunction = ({ request }) => {
  return eventStream(request.signal, (send, close) => {
    const interval = setInterval(() => {
      fetch('https://api.coincap.io/v2/rates/bitcoin')
        .then((res) => res.json())
        .then((data) => {
          try {
            send({ event: 'time', data: JSON.stringify(data) });
          } catch (e) {
            if (e instanceof TypeError) {
              close();
            }
          }
        });
    }, 500);

    return () => {
      clearInterval(interval);
    };
  });
};
