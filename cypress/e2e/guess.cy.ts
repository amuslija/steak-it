describe('guess the price', () => {
  it('should load the page', () => {
    cy.visit('/');
    // cy.intercept('/emitter/**');
    cy.findByText('STEAK IT');
  });

  it('should create a new user session', () => {
    cy.visit('/');
    cy.findByText('Score: 0');
  });

  it('should submit a lose guess', () => {
    cy.fixture('loseResult.json').then((priceEvent) => {
      cy.intercept('/emitter/**', (req) => {
        req.on('response', (res) => {
          res.setDelay(1000);
        });
        req.reply(`event: result\ndata: ${JSON.stringify(priceEvent)}\n\n`, {
          'content-type': 'text/event-stream; charset=utf-8        ',
        });
      }).as('emitter');
    });

    cy.visit('/');

    cy.findByText('Price will rise').as('up');
    cy.findByText('Price will fall').as('down');

    cy.get('@up').click();
    cy.get('@up').should('be.disabled');
    cy.get('@down').should('be.disabled').should('have.class', 'bg-background');
    cy.wait('@emitter');

    cy.findByText('You lost!');
    cy.fixture('loseResult.json').then((priceEvent: { diff: number }) => {
      cy.findByText(`You were off by ${priceEvent.diff.toFixed(2)} $USD`);
    });
  });

  it('should submit a win guess', () => {
    cy.fixture('winResult.json').then((priceEvent) => {
      cy.intercept('/emitter/**', (req) => {
        req.on('response', (res) => {
          res.setDelay(1000);
        });
        req.reply(`event: result\ndata: ${JSON.stringify(priceEvent)}\n\n`, {
          'content-type': 'text/event-stream; charset=utf-8        ',
        });
      }).as('emitter');
    });

    cy.visit('/');

    cy.findByText('Price will rise').as('up');
    cy.findByText('Price will fall').as('down');

    cy.get('@down').click();
    cy.get('@down').should('be.disabled');
    cy.get('@up').should('be.disabled').should('have.class', 'bg-background');
    cy.wait('@emitter');

    cy.findByText('You won!');
    cy.fixture('winResult.json').then(
      (priceEvent: { diff: number; guess: string }) => {
        cy.findByText(
          `The price went ${priceEvent.guess} by ${priceEvent.diff.toFixed(2)} $USD`,
        );
      },
    );
  });

  it('should show error screen in case of error', () => {
    cy.visit('/');
    cy.setCookie('__session', 'invalid');
    cy.findByText('Price will rise').as('up');
    cy.get('@up').click();
    cy.findByText('SOMETHING WENT WRONG');
  });
});
