import sk from "../_spruceKit";
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const body = await request.json();

  const cookieStore = cookies();
  const nonce = cookieStore.get('nonce');

  return NextResponse.json(
    await sk.login(
      body.siwe,
      body.signature,
      body.daoLogin,
      body.resolveEns,
      nonce?.value ?? "",
      body.resolveLens,
    ),
    {
      status: 200
    }
  );
}