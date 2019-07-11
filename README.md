# shopify-update-discounts

A script that updates Shopify discounts which apply to entire order and limits them to a specific collection.

## Prerequisites

1. Node.js version 10+
2. Create a private app in your Shopify admin panel with read & write access to discounts
3. Update your shop name, API key and password in lines 5-7 of the script file `update-discounts.js`
4. Enter your collection ID in line 10, e.g. `const collection_id = 12345678900`

## Running the script

```
npm install
node update-discounts.js
```

