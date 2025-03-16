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

export interface Results {
  fetchedProducts?: any[];
  errorASINs?: string[];
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
 * Format the title
 */
function formatTitle(title: string, wordLimit: number = 5): string {
  // Normalize spaces and remove punctuation from start and end of the title
  title = title.replace(/\s+/g, " ").trim();
  title = title.replace(/^[.,!?|()\[\]{}<>-]+|[.,!?|()\[\]{}<>-]+$/g, "");

  // Split into words, remove punctuation from each word
  let words = title.split(" ").map(word => word.replace(/^[.,!?|()\[\]{}<>-]+|[.,!?|()\[\]{}<>-]+$/g, ""));

  // Cap words to the limit
  if (words.length > wordLimit) {
    words = words.slice(0, wordLimit);
  }

  // Remove unnecessary stop words from the end
  const stopWords = new Set(["and", "or", "for", "with", "the", "a", "an", "of", "to", "on", "at", "by"]);
  while (words.length > 1 && stopWords.has(words[words.length - 1].toLowerCase())) {
    words.pop();
  }

  // Check for duplicated last two words and remove the duplicate
  if (words.length > 1 && words[words.length - 1].toLowerCase() === words[words.length - 2].toLowerCase()) {
    words.pop();
  }

  // Join words back and remove any trailing punctuation again
  let finalTitle = words.join(" ").trim();
  finalTitle = finalTitle.replace(/[.,!?|()\[\]{}<>-]+$/g, ""); // Ensure no punctuation at the end

  // Capitalize each word properly
  return finalTitle.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
}

/**
 * Fetch product details from Amazon PA-API 5.0 (Cloudflare Workers Compatible)
 */
export async function fetchAmazonProductDetails(asins: string[], env: Bindings): Promise<Results> {
  if (asins.length === 0) return { fetchedProducts: [], errorASINs: [] };

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
  let errorASINs: string[] = [];

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
        response.data.ItemsResult.Items.forEach((item: any) => {
          const asin = item.ASIN;
          const title = item.ItemInfo?.Title?.DisplayValue;
          const price = item.Offers?.Listings?.[0]?.Price?.Amount;
          const image_url = item.Images?.Primary?.Medium?.URL;

          if (!asin || !title || !price || !image_url) {
            console.error(`Skipping ASIN ${asin || "UNKNOWN"} due to missing data.`);
            errorASINs.push(asin || "UNKNOWN");
            return;
          }

          allResults.push({
            asin: asin,
            title: formatTitle(title),
            price,
            image_url,
            affiliate_url: `https://www.amazon.com/dp/${asin}?tag=${env.AMAZON_ASSOCIATE_TAG}`,
            customerReviews: 0,
            bestSellersRank: 0,
            isReward: 1,
          });
        });
      }
    } catch (error) {
      console.error("Error fetching Amazon products:", error);
      errorASINs.push(...asinChunk);
    }
  }

  return { fetchedProducts: allResults, errorASINs };
}
