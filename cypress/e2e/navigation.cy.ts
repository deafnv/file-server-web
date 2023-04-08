describe('navbar related spec', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3003')
  })

  it('go to login', () => {
    cy.get('nav').contains('Login').click()
  })

  it('go to files', () => {
    cy.get('nav').contains('Files').click()
  })
})