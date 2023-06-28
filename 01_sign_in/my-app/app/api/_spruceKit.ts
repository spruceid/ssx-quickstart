import { SpruceKitServer } from "@spruceid/sprucekit-server";

const sk = new SpruceKitServer({
  signingKey: process.env.SPRUCE_KIT_SIGNING_KEY,
});

export default sk;