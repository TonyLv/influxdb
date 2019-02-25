import {Organization} from '@influxdata/influx'

describe('Dashboards', () => {
  beforeEach(() => {
    cy.flush()

    cy.setupUser().then(({body}) => {
      cy.wrap(body.org).as('org')
    })

    cy.get<Organization>('@org').then(org => {
      cy.signin(org.id)
    })

    cy.fixture('routes').then(({dashboards}) => {
      cy.visit(dashboards)
    })
  })

  it('can create a dashboard from empty state', () => {
    cy.getByTestID('empty-state')
      .contains('Create')
      .click()

    cy.visit('/dashboards')

    cy.getByTestID('resource-card')
      .its('length')
      .should('be.eq', 1)
  })

  it('can create a dashboard from the header', () => {
    cy.get('.page-header--container')
      .contains('Create')
      .click()

    cy.getByTestID('dropdown--item New Dashboard').click()

    cy.visit('/dashboards')

    cy.getByTestID('resource-card')
      .its('length')
      .should('be.eq', 1)
  })

  it('can delete a dashboard', () => {
    cy.get<Organization>('@org').then(({id}) => {
      cy.createDashboard(id)
      cy.createDashboard(id)
    })

    cy.getByTestID('resource-card')
      .its('length')
      .should('eq', 2)

    cy.getByTestID('resource-card')
      .first()
      .trigger('mouseover')
      .within(() => {
        cy.getByTestID('context-delete-menu').click()

        cy.getByTestID('context-delete-dashboard').click()
      })

    cy.getByTestID('resource-card')
      .its('length')
      .should('eq', 1)
  })

  it('can edit a dashboards name', () => {
    cy.get<Organization>('@org').then(({id}) => {
      cy.createDashboard(id)
    })

    const newName = 'new 🅱️ashboard'

    cy.getByTestID('resource-card').within(() => {
      cy.getByTestID('dashboard-card--name').trigger('mouseover')

      cy.getByTestID('dashboard-card--name-button').click()

      cy.get('.input-field')
        .type(newName)
        .type('{enter}')
    })

    cy.visit('/dashboards')

    cy.getByTestID('resource-card').should('contain', newName)
  })

  describe('labeling', () => {
    it('can edit dashboard resource labels', () => {
      cy.createDashboard(orgID)

      cy.visit('/dashboards')

      cy.get('.index-list--row')
        .first()
        .get('.label--edit-button button')
        .first()
        .click()

      cy.get('.label-selector--input').should('be.visible')
    })

    const createDashboardAndEditLabel = (
      dashName: string,
      newLabelName: string
    ) => {
      return cy.createDashboard(orgID).then(({body}) => {
        cy.visit(`/dashboards`)

        const newDash = cy
          .getByDataTest(`dashboard-index--row ${body.id}`)
          .first()

        newDash
          .get('.index-list--row .editable-name--toggle')
          .first()
          .click()
        newDash
          .get('.editable-name--input .input-field')
          .type(dashName)
          .type('{enter}')

        newDash
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

    it('can create a dashboard resource label', () => {
      cy.visit(`/dashboards`)

      const dashName = 'Foo'
      const newLabelName = 'robits'

      createDashboardAndEditLabel(dashName, newLabelName).then(() => {
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

    it('can filter by a clicked label', () => {
      const newLabelName = 'click-me'

      cy.createDashboard(orgID)
      cy.createDashboard(orgID)

      createDashboardAndEditLabel('Foo', newLabelName)
      cy.get('.resource-labels--save-edits')
        .first()
        .click()

      cy.get('.index-list--row')
        .its('length')
        .should('eq', 3)

      cy.getByDataTest(`label--pill ${newLabelName}`)
        .first()
        .click()
      cy.getByDataTest(`search-widget ${newLabelName}`)
        .first()
        .should('have.value', newLabelName)

      cy.get('.index-list--row')
        .its('length')
        .should('eq', 1)
    })

    it('can filter labels in search widget', () => {
      const newLabelName = 'click-me'

      cy.createDashboard(orgID)
      cy.createDashboard(orgID)

      createDashboardAndEditLabel('Foo', newLabelName)
      cy.get('.resource-labels--save-edits')
        .first()
        .click()

      cy.get('.index-list--row')
        .its('length')
        .should('eq', 3)

      cy.getByDataTest(`search-widget `).type(newLabelName)

      cy.get('.index-list--row')
        .its('length')
        .should('eq', 1)

      cy.get('.index-list--row')
        .first()
        .get('.index-list--labels .label')
        .should('contain', newLabelName)
    })
  })
})
