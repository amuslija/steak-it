import {
  json,
  redirect,
  type MetaFunction,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from '@remix-run/node';
import { useFetcher, useLoaderData, useRevalidator } from '@remix-run/react';
import {
  ArrowBigUp,
  ArrowBigDown,
  Loader,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '~/components/ui/card';
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

  return (
    <div className="max-w-md">
      <Alert>
        <Loader className="size-4 animate-spin" />
        <AlertTitle>Checking Bitcoin price, please wait...</AlertTitle>
      </Alert>
    </div>
  );
};

const GuessResultBoard = ({ result }: { result: GuessResult }) => {
  const hasWon = result.guessResult === result.guess;

  return (
    <div className="">
      <Alert variant={`${hasWon ? 'success' : 'destructive'}`}>
        {hasWon ? <ThumbsUp /> : <ThumbsDown />}
        <AlertTitle>{hasWon ? 'You won!' : 'You lost!'}</AlertTitle>
        <AlertDescription>
          {hasWon
            ? `The price went ${result.guess} by ${result.diff.toFixed(2)} $USD`
            : `You were off by ${result.diff.toFixed(2)} $USD`}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default function Index() {
  const fetcher = useFetcher<typeof action>();
  const [guessResult, setGuessResult] = useState<GuessResult | null>(null);
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const data = useLoaderData<typeof loader>();
  const [hasVoted, setHasVoted] = useState(false);
  const rev = useRevalidator();

  useEffect(() => {
    if (guessResult && hasVoted) {
      setHasVoted(false);
      setVote(null);
      rev.revalidate();
    }
  }, [guessResult, rev, hasVoted]);

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
              <div className=""></div>
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
                  onClick={() => {
                    setHasVoted(true);
                    setGuessResult(null);
                    setVote('up');
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
                  onClick={() => {
                    setHasVoted(true);
                    setGuessResult(null);
                    setVote('down');
                  }}
                >
                  <ArrowBigDown />
                  Price will fall
                </Button>
              </fetcher.Form>
              <span className="text-2xl font-semibold">
                Score: {data.score}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      {hasVoted ? <GuessBox onResultChange={setGuessResult} /> : null}
      {guessResult ? <GuessResultBoard result={guessResult} /> : null}
    </div>
  );
}
