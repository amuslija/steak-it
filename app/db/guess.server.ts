import { randomUUID } from 'crypto';

import AWS from 'aws-sdk';
import { Table } from 'sst/node/table';
import { z } from 'zod';

const GuessSchema = z.object({
  userId: z.string().uuid(),
  guess: z.enum(['up', 'down', 'idle']).default('idle'),
  score: z.number().default(0),
  lastPrice: z.string().nullable().optional(),
});

const client = new AWS.DynamoDB.DocumentClient();

export const createNewUser = async () => {
  const guess = GuessSchema.parse({
    userId: randomUUID(),
  });

  await client
    .put({
      TableName: Table.GuessesTable.tableName,
      Item: guess,
    })
    .promise();

  return guess;
};

export const getUser = async (userId: string) => {
  const { Item } = await client
    .get({
      TableName: Table.GuessesTable.tableName,
      Key: { userId },
    })
    .promise();

  if (!Item) {
    return null;
  }

  return GuessSchema.parse(Item);
};

export const submitGuess = async (userId: string, guess: 'up' | 'down') => {
  const currentPrice = await fetch(
    'https://api.coincap.io/v2/rates/bitcoin',
  ).then((res) => res.json());

  const price = currentPrice.data.rateUsd;

  const { Attributes } = await client
    .update({
      TableName: Table.GuessesTable.tableName,
      Key: { userId },
      UpdateExpression: 'SET guess = :guess, lastPrice = :lastPrice',
      ExpressionAttributeValues: {
        ':guess': guess,
        ':lastPrice': price,
      },
      ReturnValues: 'ALL_NEW',
    })
    .promise();

  console.log('guess submitted');

  return GuessSchema.parse(Attributes);
};

export const updateScore = async (userId: string, score: number) => {
  const { Attributes } = await client
    .update({
      TableName: Table.GuessesTable.tableName,
      Key: { userId },
      UpdateExpression:
        'SET score = if_not_exists(score, :initial) + :score, guess = :idle, lastPrice = :null',
      ExpressionAttributeValues: {
        ':score': score,
        ':idle': 'idle',
        ':null': null,
        ':initial': 0,
      },
      ReturnValues: 'ALL_NEW',
    })
    .promise();

  return GuessSchema.parse(Attributes);
};
