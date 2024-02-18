import { Loader } from 'lucide-react';
import { useEffect } from 'react';

import { Alert, AlertTitle } from '~/components/ui/alert';
import { GuessResult, useUpdateScore } from '~/hooks/useUpdateScore';

export const GuessBox = ({
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
