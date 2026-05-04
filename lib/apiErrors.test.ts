import { describe, expect, it } from "vitest";
import { billingPortalError, checkoutError } from "./apiErrors";

describe("api error helpers", () => {
  it("explains missing Stripe checkout configuration", async () => {
    const response = checkoutError(
      new Error("STRIPE_PRICE_ID is not configured."),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.errors[0]).toContain("STRIPE_PRICE_ID");
  });

  it("explains an invalid checkout price", async () => {
    const response = checkoutError({
      code: "resource_missing",
      param: "line_items[0][price]",
      statusCode: 400,
    });
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.errors[0]).toContain("price does not exist");
  });

  it("explains Stripe billing portal outages", async () => {
    const response = billingPortalError({
      type: "StripeConnectionError",
      statusCode: 500,
    });
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.errors[0]).toContain("Stripe billing could not be reached");
  });
});
