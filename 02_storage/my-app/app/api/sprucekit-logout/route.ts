import { NextResponse } from "next/server";
import sk from "../_spruceKit";

export async function POST(request: Request) {
  return NextResponse.json(
    {
      success: await sk.logout() ?? true
    },
    {
      status: 200
    }
  );
}