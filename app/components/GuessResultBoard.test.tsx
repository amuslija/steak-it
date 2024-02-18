import { render, screen } from '@testing-library/react';
import { describe, test } from 'vitest';

import { GuessResultBoard } from './GuessResultBoard';

describe('GuessResultBoard', () => {
  test('should render a win', async () => {
    render(
      <GuessResultBoard
        result={{
          guess: 'up',
          guessResult: 'up',
          diff: 2.865,
          currentPrice: '100',
          lastPrice: '97.135',
        }}
      />,
    );

    screen.getByText('You won!');
    screen.getByText('The price went up by 2.87 $USD');
  });

  test('should render a loose', async () => {
    render(
      <GuessResultBoard
        result={{
          guess: 'down',
          guessResult: 'up',
          diff: 2.865,
          currentPrice: '100',
          lastPrice: '97.135',
        }}
      />,
    );

    screen.getByText('You lost!');
    screen.getByText('You were off by 2.87 $USD');
  });
});
