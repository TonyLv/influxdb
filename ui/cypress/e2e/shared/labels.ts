import {Organization} from '@influxdata/influx'

export const shouldEditLabels = <T>({
  resourceName,
  url,
  rowDataTest,
  createResource,
}: {
  resourceName: string
  url: string
  rowDataTest: string
  createResource: (id?: string) => Cypress.Chainable<Cypress.Response>
}) => {
  it(`can edit ${resourceName} labels`, () => {
    cy.get<Organization>('@org').then(({id}) => {
      createResource(id)
    })

    cy.visit(url)

    cy.get('.index-list--row')
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

      const newResource = cy.getByDataTest(`${rowDataTest} ${body.id}`).first()

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
          .get('.index-list--row')
          .first()
          .get('.index-list--labels .label')

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

    cy.get('.index-list--row').should('have.length', 3)

    cy.getByDataTest(`label--pill ${newLabelName}`)
      .first()
      .click()
    cy.getByDataTest(`search-widget ${newLabelName}`)
      .first()
      .should('have.value', newLabelName)

    cy.get('.index-list--row').should('have.length', 1)
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

    cy.get('.index-list--row').should('have.length', 3)

    cy.getByDataTest(`search-widget `).type(newLabelName)

    cy.get('.index-list--row').should('have.length', 1)

    cy.get('.index-list--row')
      .first()
      .get('.index-list--labels .label')
      .should('contain', newLabelName)
  })
}
