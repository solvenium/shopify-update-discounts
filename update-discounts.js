const _ = require("lodash");
const Shopify = require("shopify-api-node");
 
const shopify = new Shopify({
  shopName: "your-shop-name",
  apiKey: "your-api-key",
  password: "your-app-password"
});

const collection_id = "your-collection-id";

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    try {
        const totalCount = (await shopify.request(_.assign({ path: "/admin/price_rules/count.json" }, shopify.baseUrl), "GET")).count;
        console.log("Processing %s discount codes.", totalCount);
        const pageSize = 250;
        let processedCount = 0;
        let last_created_at = undefined;
        while (processedCount < totalCount) {
            await delay(500); // respect the Shopify API rate limit (2 calls per second)
            const discountCodes = await shopify.priceRule.list({
                limit: pageSize,
                created_at_max: last_created_at
            });
            if (discountCodes.length == 0) {
                return
            }
            for (const discountCode of discountCodes) {
                processedCount++;
                if (discountCode.target_selection == "all" && discountCode.target_type != "shipping_line") {
                    discountCode.target_selection = "entitled";
                    discountCode.entitled_collection_ids = [collection_id];
                    await delay(500); // respect the Shopify API rate limit (2 calls per second)
                    const updatedDiscountCode = await shopify.priceRule.update(discountCode.id, discountCode);
                    console.log("[%s/%s] Updated discount code id: %s, title: %s", processedCount, totalCount, updatedDiscountCode.id, updatedDiscountCode.title)
                } else if (discountCode.target_type == "shipping_line") {
                    console.log("[%s/%s] Skipping discount code (id: %s, title: %s) because can't limit free shipping to specific collections", processedCount, totalCount, discountCode.id, discountCode.title);
                } else {
                    console.log("[%s/%s] Skipping discount code (id: %s, title: %s) because it alredy doesn't apply to entire order.", processedCount, totalCount, discountCode.id, discountCode.title);
                }
                last_created_at = discountCode.created_at;
            }
        }
    } catch (error) {
        const response_body = error.response && error.response.body;
        console.error("Error message: %s, response body: %j, stack: %s", error, response_body, error.stack);
    }
})();