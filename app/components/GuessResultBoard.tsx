import { ThumbsUp, ThumbsDown } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { GuessResult } from '~/hooks/useUpdateScore';

export const GuessResultBoard = ({ result }: { result: GuessResult }) => {
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
