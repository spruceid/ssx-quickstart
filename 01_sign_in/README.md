# Implement UserAuthorization Module 

> This section installs SSX as a dependency and lets the user sign in to the app using Ethereum keys. 

A completed version of this part can be found in the example repository ([01_sign_in](https://github.com/spruceid/ssx-quickstart/tree/main/01_sign_in)).

## Connect SSX to Backend

To use the SSX library on the backend, you must install `@spruceid/ssx-server`. Furthermore, we must create the routes required by the authorization module (nonce, sign in, and sign out) for our Next app. To add those, use the following commands:

```bash
npm i @spruceid/ssx-server 
mkdir app/api \
      app/api/ssx-nonce \
      app/api/ssx-login \
      app/api/ssx-logout
touch .env.local \
      app/api/_ssx.ts \
      app/api/ssx-nonce/route.ts \
      app/api/ssx-login/route.ts \
      app/api/ssx-logout/route.ts
```

Then, add an environment variable into the `my-app/.env.local` file:

```bash
SPRUCE_KIT_SIGNING_KEY=anythingyouwanthere
```

Add a helper file to our code so that we don't have to instantiate a new SSX Server object directly every time. Add the following to `my-app/app/api/_ssx.ts` file:

```ts
import { SSXServer } from "@spruceid/ssx-server";

const ssx = new SSXServer({
  signingKey: process.env.SPRUCE_KIT_SIGNING_KEY,
});

export default ssx;
```

Now, create an API route for generating a random nonce. This is used to identify the session and prevent replay attacks. Add the following to `my-app/app/api/ssx-nonce/route.ts` file:

```ts
import ssx from "../_ssx";

export async function GET(request: Request) {
  const nonce = ssx.generateNonce();
  return new Response(nonce, {
    status: 200,
    headers: { 'Set-Cookie': `nonce=${nonce}` }
  });
}
```

Add a sign-in API route. This route will do all necessary checks in the SIWE message, ensuring it's valid. All checks occur inside the `ssx.login()` function. Add the following to `my-app/app/api/ssx-login/route.ts` file:

```ts
import ssx from "../_ssx";
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const body = await request.json();

  const cookieStore = cookies();
  const nonce = cookieStore.get('nonce');

  return NextResponse.json(
    await ssx.login(
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
```

Finally, create the sign-out API route. Add the following to `my-app/app/api/ssx-logout/route.ts` file:

```ts
import { NextResponse } from "next/server";
import ssx from "../_ssx";

export async function POST(request: Request) {
  return NextResponse.json(
    {
      success: await ssx.logout() ?? true
    },
    {
      status: 200
    }
  );
}
```


## Connect SSX to Frontend

To use the SSX library on the frontend you must install `@spruceid/ssx`. Furthermore, we need to create a component to create the authorization module logic. To add it, use the following commands:

```bash
npm i @spruceid/ssx
mkdir components
touch components/SSXComponent.tsx
```

Let's update some CSS by adding the following to `my-app/app/globals.css` file:

```css
h1,
h2 {
  margin: 0px;
}

h2 span {
  font-size: 12px;
}

body {
  padding: 10px;
}

@media (prefers-color-scheme: dark) {
  html {
    color-scheme: dark;
  }
}

button {
  background: hsl(0, 0%, 60%);
  border-radius: 12px;
  border: none;
  padding: 0;
  cursor: pointer;
  outline-offset: 4px;
}

button span {
  display: block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.9rem;
  background: hsl(153, 33%, 95%);
  color: black;
  transform: translateY(-4px);
  will-change: transform;
  transition: transform 250ms;
}

button:hover span {
  transform: translateY(-8px);
}

button:active span {
  transform: translateY(-2px);
}

button:disabled span {
  transform: translateY(-2px);
  opacity: .7;
}

table {
  border-collapse: separate;
  border-spacing: 0 1em;
}
```

Then update the NextConfig to make it compatible with SSX by adding the bellow command to `my-app/next.config.js` file:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    })
    return config
  },
}

module.exports = nextConfig
```


Now create the sign-in and sign-out logic by adding the following to `my-app/components/SSXComponent.tsx` file:

```ts
"use client";
import { SSX } from "@spruceid/ssx";
import { useState } from "react";

const SSXComponent = () => {

  const [ssxProvider, setSSX] = useState<SSX | null>(null);

  const ssxHandler = async () => {
    const ssx = new SSX({
      providers: {
        server: {
          host: "http://localhost:3000/api"
        }
      },
    });
    await ssx.signIn();
    setSSX(ssx);
  };

  const ssxLogoutHandler = async () => {
    ssxProvider?.signOut();
    setSSX(null);
  };

  const address = ssxProvider?.address() || '';

  return (
    <>
      <h2>User Authorization Module</h2>
      <p>Authenticate and Authorize using your ETH keys</p>
      {
        ssxProvider ?
          <>
            {
              address &&
              <p>
                <b>Ethereum Address:</b> <code>{address}</code>
              </p>
            }
            <br />
            <button onClick={ssxLogoutHandler}>
              <span>
                Sign-Out
              </span>
            </button>
          </> :
          <button onClick={ssxHandler}>
            <span>
              Sign-In with Ethereum
            </span>
          </button>
      }
    </>
  );
};

export default SSXComponent;
```

Finally, add the following to `my-app/app/page.tsx`:

```ts 
import SSXComponent from '@/components/SSXComponent';

export default function Home() {
  return (
    <SSXComponent />
  )
}
```

This SSX configuration assumes you are running the Next.js project using the default port (3000). If you are running in a different port, change the providers.server.host in the SSX config.

That's it! Now you can run the app by using:

```bash
npm run dev
```

You can visit [http://localhost:3000](http://localhost:3000) to view your application. 
