describe('navbar related spec', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3003/files/[TESTING_ONLY]')
  })

  it('drag around file no drop', () => {
    const firstFile = cy.get('[data-isfilename]').first()
    const draggedFile = cy.get('[data-cy="dragged-file"]')
    
    firstFile
      .trigger('mousedown', { button: 0 })
      .trigger('mousemove', 'topLeft')

    draggedFile
      .should('be.visible')

    firstFile.trigger('mouseup', { force: true })
  })

  it('drag around into folder', () => {
    //! Incomplete
    const firstFile = cy.get('[data-isfilename]').first()
    const draggedFile = cy.get('[data-cy="dragged-file"]')
    
    firstFile
      .trigger('mousedown', { button: 0 })
      .trigger('mousemove', 'topLeft')

    draggedFile
      .should('be.visible')

    firstFile.trigger('mouseup', { force: true })
  })
})