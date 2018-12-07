describe("Testing basic values rendering in the ui", () => {
  before(() => {
    cy.viewport(1280, 720)
  })

  it("Successfully opens page", () => {
    cy.visit("/")
    cy.get(".connection > p").should("contain", "Connected")
    cy.get("#metrics-container").should("be.visible")
  })

  it("Has values in all value elements", () => {
    // Wait for data to start coming in
    cy.wait(1000)
    cy.get("p.value").each(p => {
      assert.isNotNaN(parseInt(p.text()))
    })
  })
})