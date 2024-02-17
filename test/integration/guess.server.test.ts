import { describe, expect, test } from 'vitest';

import {
  type GuessType,
  createNewUser,
  getUser,
  submitGuess,
  updateScore,
} from '../../app/db/guess.server';

let guess: GuessType;

describe('User Guess Model', () => {
  test('should create a new user', async () => {
    guess = await createNewUser();
    expect(guess).toEqual(
      expect.objectContaining({
        userId: expect.any(String),
        score: 0,
        guess: 'idle',
      }),
    );
  });

  test('should fetch the user', async () => {
    const user = await getUser(guess.userId);
    expect(user).toEqual(guess);
  });

  test('should submit a guess', async () => {
    const submittedGuess = await submitGuess(guess.userId, 'up');
    expect(submittedGuess).toEqual(
      expect.objectContaining({
        userId: guess.userId,
        score: 0,
        guess: 'up',
        lastPrice: expect.any(String),
      }),
    );
  });

  test('should update the score', async () => {
    const updatedGuess = await updateScore(guess.userId, 1);
    expect(updatedGuess).toEqual(
      expect.objectContaining({
        userId: guess.userId,
        score: 1,
        guess: 'idle',
        lastPrice: null,
      }),
    );
  });
});
