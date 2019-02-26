import {Organization} from '@influxdata/influx'

export const shouldEditLabels = <T>({
  resourceName,
  url,
  rowTestID,
  labelsTestID,
  createResource,
}: {
  resourceName: string
  url: string
  rowTestID: string
  labelsTestID: (id?: string) => string
  createResource: (id?: string) => Cypress.Chainable<Cypress.Response>
}) => {
  it(`can edit ${resourceName} labels`, () => {
    cy.get<Organization>('@org').then(({id}) => {
      createResource(id)
    })

    cy.visit(url)

    cy.getByTestID(rowTestID)
      .first()
      .get('.label--edit-button button')
      .first()
      .click()

    cy.get('.label-selector--input').should('be.visible')
  })

  const createResourceAndEditLabel = (
    orgID: string | undefined,
    newLabelName: string
  ) => {
    return createResource(orgID).then(({body}) => {
      cy.visit(url)

      const newResource = cy.getByTestID(labelsTestID(body.id)).first()

      newResource
        .get('.label--edit-button button')
        .first()
        .click()

      cy.get('.label-selector--input .input-field')
        .first()
        .click()
        .type(newLabelName)

      cy.get('.resource-label--create-button').click()
    })
  }

  it(`can create a ${resourceName} resource label`, () => {
    cy.visit(url)

    const newLabelName = 'robits'

    cy.get<Organization>('@org').then(({id}) => {
      createResourceAndEditLabel(id, newLabelName).then(() => {
        cy.get('.label-selector--selected .label')
          .first()
          .should('contain', newLabelName)

        cy.get('.resource-labels--save-edits')
          .first()
          .click()

        const labelPills = cy
          .getByTestID(rowTestID)
          .first()
          .get('.label')

        labelPills.should('contain', newLabelName)
      })
    })
  })

  it(`can filter ${resourceName} by a clicked label`, () => {
    const newLabelName = 'click-me'

    cy.get<Organization>('@org').then(({id}) => {
      createResource(id)
      createResource(id)
      createResourceAndEditLabel(id, newLabelName)
    })

    cy.get('.resource-labels--save-edits')
      .first()
      .click()

    cy.getByTestID(rowTestID).should('have.length', 3)

    cy.getByTestID(`label--pill ${newLabelName}`)
      .first()
      .click()
    cy.getByTestID(`search-widget ${newLabelName}`)
      .first()
      .should('have.value', newLabelName)

    cy.getByTestID(rowTestID).should('have.length', 1)
  })

  it(`can filter ${resourceName} by labels in search widget`, () => {
    const newLabelName = 'click-me'

    cy.get<Organization>('@org').then(({id}) => {
      createResource(id)
      createResource(id)
      createResourceAndEditLabel(id, newLabelName)
    })

    cy.get('.resource-labels--save-edits')
      .first()
      .click()

    cy.getByTestID(rowTestID).should('have.length', 3)

    cy.getByTestID(`search-widget `).type(newLabelName)

    cy.getByTestID(rowTestID).should('have.length', 1)

    cy.getByTestID(rowTestID)
      .first()
      .get('.label')
      .should('contain', newLabelName)
  })
}
