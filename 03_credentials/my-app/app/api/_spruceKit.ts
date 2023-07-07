import { SpruceKitServer } from "@spruceid/ssx-server";

const ssx = new SpruceKitServer({
  signingKey: process.env.SPRUCE_KIT_SIGNING_KEY,
});

export default ssx;