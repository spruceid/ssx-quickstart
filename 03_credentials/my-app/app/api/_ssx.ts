import { SSXServer } from "@spruceid/ssx-server";

const ssx = new SSXServer({
  signingKey: process.env.SSX_SIGNING_KEY,
});

export default ssx;