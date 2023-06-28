import sk from "../_spruceKit";

export async function GET(request: Request) {
  const nonce = sk.generateNonce();
  return new Response(nonce, {
    status: 200,
    headers: { 'Set-Cookie': `nonce=${nonce}` }
  });
}