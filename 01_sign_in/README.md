# Implement UserAuthorization Module 

> This section installs SpruceKit as a dependency and lets the user sign in to the app using Ethereum keys. 

A completed version of this part can be found in the example repository ([01_sign_in](https://github.com/spruceid/sprucekit-quickstart/tree/main/01_sign_in)).

## Connect SpruceKit to Backend

To use the SpruceKit library on the backend, you must install `@spruceid/sprucekit-server`. Furthermore, we must create the routes required by the authorization module (nonce, sign in, and sign out) for our Next app. To add those, use the following commands:

```bash
npm i @spruceid/sprucekit-server 
mkdir app/api \
      app/api/sprucekit-nonce \
      app/api/sprucekit-login \
      app/api/sprucekit-logout
touch .env.local \
      app/api/_spruceKit.ts \
      app/api/sprucekit-nonce/route.ts \
      app/api/sprucekit-login/route.ts \
      app/api/sprucekit-logout/route.ts
```

Then, add an environment variable into the `my-app/.env.local` file:

```bash
SPRUCE_KIT_SIGNING_KEY=anythingyouwanthere
```

Add a helper file to our code so that we don't have to instantiate a new SpruceKit Server object directly every time. Add the following to `my-app/app/api/_spruceKit.ts` file:

```ts
import { SpruceKitServer } from "@spruceid/sprucekit-server";

const sk = new SpruceKitServer({
  signingKey: process.env.SPRUCE_KIT_SIGNING_KEY,
});

export default sk;
```

Now, create an API route for generating a random nonce. This is used to identify the session and prevent replay attacks. Add the following to `my-app/app/api/sprucekit-nonce/route.ts` file:

```ts
import sk from "../_spruceKit";

export async function GET(request: Request) {
  const nonce = sk.generateNonce();
  return new Response(nonce, {
    status: 200,
    headers: { 'Set-Cookie': `nonce=${nonce}` }
  });
}
```

Add a sign-in API route. This route will do all necessary checks in the SIWE message, ensuring it's valid. All checks occur inside the `sprucekit.login()` function. Add the following to `my-app/app/api/sprucekit-login/route.ts` file:

```ts
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
```

Finally, create the sign-out API route. Add the following to `my-app/app/api/sprucekit-logout/route.ts` file:

```ts
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
```


## Connect SpruceKit to Frontend

To use the SpruceKit library on the frontend you must install `@spruceid/sprucekit`. Furthermore, we need to create a component to create the authorization module logic. To add it, use the following commands:

```bash
npm i @spruceid/sprucekit
mkdir components
touch components/SpruceKitComponent.tsx
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

Then update the NextConfig to make it compatible with SpruceKit by adding the bellow command to `my-app/next.config.js` file:

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


Now create the sign-in and sign-out logic by adding the following to `my-app/components/SpruceKitComponent.tsx` file:

```ts
"use client";
import { SpruceKit } from "@spruceid/sprucekit";
import { useState } from "react";

const SpruceKitComponent = () => {

  const [skProvider, setSpruceKit] = useState<SpruceKit | null>(null);

  const spruceKitHandler = async () => {
    const sk = new SpruceKit({
      providers: {
        server: {
          host: "http://localhost:3000/api"
        }
      },
    });
    await sk.signIn();
    setSpruceKit(sk);
  };

  const spruceKitLogoutHandler = async () => {
    skProvider?.signOut();
    setSpruceKit(null);
  };

  const address = skProvider?.address() || '';

  return (
    <>
      <h2>User Authorization Module</h2>
      <p>Authenticate and Authorize using your ETH keys</p>
      {
        skProvider ?
          <>
            {
              address &&
              <p>
                <b>Ethereum Address:</b> <code>{address}</code>
              </p>
            }
            <br />
            <button onClick={spruceKitLogoutHandler}>
              <span>
                Sign-Out
              </span>
            </button>
          </> :
          <button onClick={spruceKitHandler}>
            <span>
              Sign-In with Ethereum
            </span>
          </button>
      }
    </>
  );
};

export default SpruceKitComponent;
```

Finally, add the following to `my-app/app/page.tsx`:

```ts 
import SpruceKitComponent from '@/components/SpruceKitComponent';

export default function Home() {
  return (
    <SpruceKitComponent />
  )
}
```

This SpruceKit configuration assumes you are running the Next.js project using the default port (3000). If you are running in a different port, change the providers.server.host in the SpruceKit config.

That's it! Now you can run the app by using:

```bash
npm run dev
```

You can visit [http://localhost:3000](http://localhost:3000) to view your application. 
