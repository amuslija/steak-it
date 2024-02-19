import { json } from '@remix-run/node';
import { createRemixStub } from '@remix-run/testing';
import { render, screen, waitFor } from '@testing-library/react';
import EventSource, { sources } from 'eventsourcemock';
import { EventSourceMap, EventSourceProvider } from 'remix-utils/sse/react';
import { describe, test, vi, expect } from 'vitest';

import { GuessBox } from './GuessBox';

Object.defineProperty(window, 'EventSource', {
  value: EventSource,
});

const messageEvent = new MessageEvent('result', {
  data: '{"currentPrice":"100","guess":"up","lastPrice":"97.135","diff":2.865,"guessResult":"up"}',
});
const map: EventSourceMap = new Map();

describe('GuessBox', () => {
  test('should render a loading state', async () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const onResultChange = () => {};
    const spy = vi.fn(onResultChange);

    const Component = () => (
      <EventSourceProvider value={map}>
        <GuessBox onResultChange={spy} />
      </EventSourceProvider>
    );

    const Stub = createRemixStub([
      {
        path: '/',
        loader() {
          return json({ user: { userId: '123' }, btcRate: '52393.9306' });
        },
        Component: Component,
      },
    ]);

    render(<Stub />);

    await waitFor(() =>
      screen.findByText('Checking Bitcoin price, please wait...'),
    );

    sources['/emitter/123'].emitOpen();
    sources['/emitter/123'].emit(messageEvent.type, messageEvent);

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
  });
});
