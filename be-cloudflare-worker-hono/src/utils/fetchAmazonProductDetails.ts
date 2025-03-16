import axios from "axios";

// Amazon API Endpoint
const ENDPOINT = "webservices.amazon.com";
const REGION = "us-east-1";
const SERVICE = "ProductAdvertisingAPI";

interface Bindings {
  AMAZON_ACCESS_KEY: string;
  AMAZON_SECRET_KEY: string;
  AMAZON_ASSOCIATE_TAG: string;
}

/**
 * Converts ArrayBuffer to Hex String
 */
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generates an HMAC-SHA256 signature using Web Crypto API (Cloudflare Workers Compatible)
 */
async function signRequest(payload: string, env: Bindings): Promise<{ signature: string; timestamp: string; credentialScope: string }> {
  const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = timestamp.slice(0, 8);
  const credentialScope = `${date}/${REGION}/${SERVICE}/aws4_request`;

  async function hmacSHA256(key: ArrayBuffer, data: string): Promise<ArrayBuffer> {
    const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
  }

  // Create signing key
  const keyMaterial = new Uint8Array(new TextEncoder().encode("AWS4" + env.AMAZON_SECRET_KEY)).slice().buffer;
  let signingKey = await hmacSHA256(keyMaterial, date);
  signingKey = await hmacSHA256(signingKey, REGION);
  signingKey = await hmacSHA256(signingKey, SERVICE);
  signingKey = await hmacSHA256(signingKey, "aws4_request");

  // Compute payload hash
  const payloadHashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
  const payloadHash = arrayBufferToHex(payloadHashBuffer);

  // Compute Canonical Request
  const canonicalRequest = [
    "POST",
    "/paapi5/getitems",
    "",
    `content-type:application/json; charset=UTF-8\nhost:${ENDPOINT}\nx-amz-date:${timestamp}\nx-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems`,
    "",
    "content-type;host;x-amz-date;x-amz-target",
    payloadHash
  ].join("\n");

  // Compute Canonical Request Hash
  const canonicalRequestHashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonicalRequest));
  const canonicalRequestHash = arrayBufferToHex(canonicalRequestHashBuffer);

  // Compute String to Sign
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    timestamp,
    credentialScope,
    canonicalRequestHash
  ].join("\n");

  // Compute Signature
  const signatureBuffer = await hmacSHA256(signingKey, stringToSign);
  const signatureHex = arrayBufferToHex(signatureBuffer);

  return { signature: signatureHex, timestamp, credentialScope };
}

/**
 * Fetch product details from Amazon PA-API 5.0 (Cloudflare Workers Compatible)
 */
export async function fetchAmazonProductDetails(asins: string[], env: Bindings) {
  if (asins.length === 0) return [];

  // Split ASINs into chunks of 10 (Amazon limit)
  const chunkArray = (array: string[], chunkSize: number) => {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  };

  const asinChunks = chunkArray(asins, 10);
  let allResults: any[] = [];

  for (const asinChunk of asinChunks) {
    const params = {
      "Marketplace": "www.amazon.com",
      "PartnerTag": env.AMAZON_ASSOCIATE_TAG,
      "PartnerType": "Associates",
      "Operation": "GetItems",
      "ItemIds": asinChunk,
      "Resources": [
        "Images.Primary.Medium",
        "ItemInfo.Title",
        "Offers.Listings.Price",
        "ItemInfo.ProductInfo",
        "ItemInfo.ByLineInfo"
      ]
    };

    const payload = JSON.stringify(params);
    const { signature, timestamp, credentialScope } = await signRequest(payload, env);

    const requestUrl = `https://${ENDPOINT}/paapi5/getitems`;

    try {
      const response = await axios.post(requestUrl, payload, {
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          "Host": ENDPOINT,
          "X-Amz-Date": timestamp,
          "X-Amz-Target": "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems",
          "User-Agent": "paapi-docs-curl/1.0.0",
          "Content-Encoding": "amz-1.0",
          "Authorization": `AWS4-HMAC-SHA256 Credential=${env.AMAZON_ACCESS_KEY}/${credentialScope}, SignedHeaders=content-type;host;x-amz-date;x-amz-target, Signature=${signature}`
        }
      });

      if (response.data.ItemsResult?.Items) {
        const extractedProducts = response.data.ItemsResult.Items.map((item: any) => ({
          title: item.ItemInfo?.Title?.DisplayValue || "Unknown Title",
          price: item.Offers?.Listings?.[0]?.Price?.Amount || 0,
          image_url: item.Images?.Primary?.Medium?.URL || "",
          affiliate_url: `https://www.amazon.com/dp/${item.ASIN}?tag=${env.AMAZON_ASSOCIATE_TAG}`,
          customerReviews: 0,
          bestSellersRank: 0,
          isReward: 1,
        }));

        allResults = allResults.concat(extractedProducts);
      }
    } catch (error) {
      console.error("Error fetching Amazon products:", error);
    }
  }

  return allResults;
}
