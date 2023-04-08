describe('state-changing interactions with file list', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3003/files/[TESTING_ONLY]')
  })

  it('create new folder and delete', () => {
    cy.login()

    cy.get('[data-cy="file-list"]')
      .trigger('mousemove', 'bottomLeft', { force: true })
      .trigger('contextmenu', { force: true })

    cy.get('[data-cy="context-menu"]').contains('New Folder').click()

    cy.get('[data-cy="new-folder-input"]').type('CYPRESS TEST FOLDER')
    cy.get('[data-cy="new-folder-submit"]').click()
    cy.wait(1000)

    cy.get('[data-isfilename]').contains('CYPRESS TEST FOLDER').trigger('contextmenu', { force: true })
    cy.get('[data-cy="context-menu"]').contains('Delete').click()
    cy.get('[data-cy="dialog-delete"]').contains('Yes').click()
  })
})