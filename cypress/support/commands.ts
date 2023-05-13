/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

import '@4tw/cypress-drag-drop'

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      login(): Chainable<void>;
      delete(name: string): Chainable<void>;
    }
}
}

Cypress.Commands.add('login', () => {
  cy.get('nav').contains('Login').click()
  cy.get('[data-cy="username"]').type(Cypress.env('test_user'))
  cy.get('[data-cy="password"]').type(Cypress.env('test_password'))
  cy.get('[data-cy="submit"]').click()
  cy.wait(500)
  cy.go('back').go('back')
  cy.wait(500)
})

Cypress.Commands.add('delete', (name) => {
  cy.get('[data-isfilename]').contains(name).trigger('contextmenu', { force: true })
  cy.get('[data-cy="context-menu"]').contains('Delete').click()
  cy.get('[data-cy="dialog-delete"]').contains('Yes').click()
})