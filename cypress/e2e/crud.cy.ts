describe('state-changing interactions with file list', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3003/files/[TESTING_ONLY]')
  })

  it('create new folder, move around, and delete', () => {
    cy.login()

    //* Create test folder
    cy.get('[data-cy="file-list"]')
      .trigger('mousemove', 'bottomLeft', { force: true })
      .trigger('contextmenu', { force: true })
    cy.get('[data-cy="context-menu"]').contains('New Folder').click()
    cy.get('[data-cy="new-folder-input"]').type('CYPRESS TEST FOLDER')
    cy.get('[data-cy="new-folder-submit"]').click()
    cy.wait(1000)

    //* Move test folder to root and go to root
    cy.get('[data-isfilename]').contains('CYPRESS TEST FOLDER').drag('a[data-path="/"]')
    cy.get('a[data-path="/"]').click()
    cy.wait(1000)
    
    //* Move test folder to testing folder with context menu move
    cy.get('[data-isfilename]').contains('CYPRESS TEST FOLDER').trigger('contextmenu', { force: true })
    cy.get('[data-cy="context-menu"]').contains('Move').click()
    cy.get('span[title="[TESTING_ONLY]"]').click()
    cy.get('button').contains('Move').click()
    cy.wait(1000)

    //* Go to testing folder
    cy.get('[data-isfilename]').contains('[TESTING_ONLY]').dblclick()
    cy.wait(1000)
    
    //* Rename test folder
    cy.get('[data-isfilename]').contains('CYPRESS TEST FOLDER').trigger('contextmenu', { force: true })
    cy.get('[data-cy="context-menu"]').contains('Rename').click()
    cy.get('[data-cy="rename-input"]').find('input').focus().clear().type('Cypress Test Folder')
    cy.get('button').contains('OK').click()
    cy.wait(1000)

    //* Delete test folder
    cy.delete('Cypress Test Folder')
  })

  it('upload file, delete file', () => {
    cy.login()

    cy.get('input[type=file]').selectFile('cypress/fixtures/example.json', { force: true })

    cy.delete('example.json')
  })
})