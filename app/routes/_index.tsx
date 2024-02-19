import {
  json,
  redirect,
  type MetaFunction,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from '@remix-run/node';
import { useFetcher, useLoaderData, useRevalidator } from '@remix-run/react';
import { isbot } from 'isbot';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '~/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '~/components/ui/card';
import { createNewUser, getUser, submitGuess } from '~/db/guess.server';
import { GuessResult } from '~/hooks/useUpdateScore';
import { commitSession, destroySession, getSession } from '~/sessions.server';

import { GuessBox } from '../components/GuessBox';
import { GuessResultBoard } from '../components/GuessResultBoard';

export const meta: MetaFunction = () => {
  return [
    { title: '🥩 Steak It' },
    { name: 'description', content: 'Guess crypto prices and win steaks' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (isbot(request.headers.get('user-agent') || '')) {
    return new Response('bots allowed', { status: 200 });
  }

  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');
  if (!userId) {
    const user = await createNewUser();
    session.set('userId', user.userId);
    return redirect('/', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  const user = await getUser(userId);

  if (!user) {
    throw new Response('User not found', {
      status: 404,
      headers: {
        'Set-Cookie': await destroySession(session),
      },
    });
  }

  const btcRate = await fetch('https://api.coincap.io/v2/rates/bitcoin').then(
    (res) => res.json(),
  );

  return json({
    user,
    btcRate: btcRate.data.rateUsd,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');

  if (!userId) {
    throw new Error('No user id provided');
  }

  const data = await request.formData();
  const vote = data.get('up') ? 'up' : 'down';
  const guess = await submitGuess(userId, vote);
  return json(guess);
};

export default function Index() {
  const fetcher = useFetcher<typeof action>();
  const [guessResult, setGuessResult] = useState<GuessResult | null>(null);
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const data = useLoaderData<typeof loader>();
  const rev = useRevalidator();

  useEffect(() => {
    if (guessResult && vote) {
      setVote(null);
      rev.revalidate();
    }
  }, [guessResult, vote, rev]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="mb-24 flex flex-row text-8xl font-semibold">
        <h1 className="mr-5 animate-bounce">🥩</h1>
        <h1> STEAK IT</h1>
      </div>
      <div className="mb-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-row justify-between gap-5">
              <span>Guess the price of Bitcoin and win a steak!</span>
            </CardTitle>
            <CardDescription>
              The highest weekly score gets a free steak.
            </CardDescription>
            <CardDescription className="font-semibold">
              Current BTC price in USD is ${Number(data.btcRate).toFixed(4)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row items-center justify-between">
              <fetcher.Form method="POST">
                <Button
                  type="submit"
                  name="up"
                  value="up"
                  className="mx-2 rounded-sm border border-solid p-2"
                  variant={vote === 'down' ? 'outline' : 'default'}
                  disabled={!!vote}
                  onClick={(e) => {
                    e.preventDefault();
                    setVote('up');
                    setGuessResult(null);
                    fetcher.submit(e.currentTarget);
                  }}
                >
                  <ArrowBigUp />
                  Price will rise
                </Button>
                <Button
                  type="submit"
                  name="down"
                  value="DOWN"
                  className="mx-2 rounded-sm border border-solid p-2"
                  variant={vote === 'up' ? 'outline' : 'default'}
                  disabled={!!vote}
                  onClick={(e) => {
                    e.preventDefault();
                    setVote('down');
                    setGuessResult(null);
                    fetcher.submit(e.currentTarget);
                  }}
                >
                  <ArrowBigDown />
                  Price will fall
                </Button>
              </fetcher.Form>
              <span className="text-2xl font-semibold">
                Score: {data.user.score}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      {vote ? <GuessBox onResultChange={setGuessResult} /> : null}
      {guessResult ? <GuessResultBoard result={guessResult} /> : null}
    </div>
  );
}

export const ErrorBoundary = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="mb-12 flex flex-row text-5xl font-semibold">
        <h1 className="mr-5 animate-pulse">😭</h1>
        <h1>SOMETHING WENT WRONG</h1>
      </div>
      <div>
        <span className="text-xl font-semibold">
          Please refresh your browser window. Who knows, you might win a steak.
        </span>
      </div>
    </div>
  );
};
