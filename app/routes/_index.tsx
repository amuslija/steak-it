import {
  json,
  redirect,
  type MetaFunction,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from '@remix-run/node';
import { useFetcher, useLoaderData, useRevalidator } from '@remix-run/react';
import { useEffect, useState } from 'react';

import { createNewUser, getUser, submitGuess } from '~/db/guess.server';
import { GuessResult, useUpdateScore } from '~/hooks/useUpdateScore';
import { commitSession, getSession } from '~/sessions';

export const meta: MetaFunction = () => {
  return [
    { title: 'Steak It' },
    { name: 'description', content: 'Guess crypto prices and win steaks' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
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
    throw new Error('test');
  }

  return json(user);
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

const GuessBox = ({
  onResultChange,
}: {
  onResultChange: (score: GuessResult | null) => void;
}) => {
  const { score, guessState } = useUpdateScore();

  useEffect(() => {
    onResultChange(null);
  }, [onResultChange]);

  useEffect(() => {
    if (guessState === 'done' && score) {
      onResultChange(score);
    }
  }, [score, guessState, onResultChange]);

  return <div>Spinner is spinning</div>;
};

const GuessResultBoard = ({ result }: { result: GuessResult }) => {
  return (
    <div>
      <h2>Result:</h2>
      <p>
        Your guess was: {result.guess} and the result was {result.guessResult}
      </p>
      <p>
        The last price was {result.lastPrice} and the current price is{' '}
        {result.currentPrice}
      </p>
    </div>
  );
};

export default function Index() {
  const fetcher = useFetcher<typeof action>();
  const [guessResult, setGuessResult] = useState<GuessResult | null>(null);
  const data = useLoaderData<typeof loader>();
  const [hasVoted, setHasVoted] = useState(false);
  const rev = useRevalidator();

  useEffect(() => {
    if (guessResult && hasVoted) {
      setHasVoted(false);
      rev.revalidate();
    }
  }, [guessResult, rev, hasVoted]);

  return (
    <div className="flex flex-col items-center">
      <h1>🥩 Steak it:</h1>
      <p>
        Guess the price of Bitcoin and win a steak! The highest weekly score
        gets a free steak.
      </p>
      <div>
        <h1>Your current score is: {data.score}!</h1>
      </div>
      <fetcher.Form method="POST">
        <input
          type="submit"
          name="up"
          value="UP"
          className="border border-solid rounded-sm p-2 mx-2"
          onClick={() => {
            setHasVoted(true);
            setGuessResult(null);
          }}
        />
        <input
          type="submit"
          name="down"
          value="DOWN"
          className="border border-solid rounded-sm p-2 mx-2"
          onClick={() => {
            setHasVoted(true);
            setGuessResult(null);
          }}
        />
      </fetcher.Form>
      {hasVoted ? <GuessBox onResultChange={setGuessResult} /> : null}
      {guessResult ? <GuessResultBoard result={guessResult} /> : null}
    </div>
  );
}
