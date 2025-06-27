"server only";

import { PinataSDK } from "pinata";

if (!process.env.PINATA_JWT) {
  throw new Error("PINATA_JWT environment variable is not set");
}

if (!process.env.NEXT_PUBLIC_PINATA_GATEWAY) {
  throw new Error("NEXT_PUBLIC_PINATA_GATEWAY environment variable is not set");
}

export const pinata = new PinataSDK({
  pinataJwt: `${process.env.PINATA_JWT}`,
  pinataGateway: `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}`,
});
