# Integrate SpruceKit Issuer Component

> This section integrates the functionality to generate a credential via the SpruceKit issuer.

A completed version of this part can be found in the example repository ([04_sprucekit_issuer](https://github.com/spruceid/sprucekit-quickstart/tree/main/04_sprucekit_issuer)).

The SpruceKit Issuer is an early demo app where users can Sign-In with Ethereum to obtain various credentials that are saved in an off-chain data vault. You can learn more about the app on the SpruceKit blog, or try it out for yourself here.
In this step, we will use the credentials module to access credentials issued in the app. To get started is simple:
1. Visit https://issuer.sprucekit.dev
2. Sign in with your Ethereum account
3. Follow the instructions to get a credential of your choice issued

You can create the folders and files by yourself or by running the bash command below:
```bash
touch components/SpruceKitCredentialComponent.tsx
```

Add the following into `my-app/components/SpruceKitCredentialComponent.tsx`
```tsx
import { SSX } from "@spruceid/ssx";
import { useEffect, useState } from "react";
import { toCredentialEntry } from "@/utils/rebase";

interface ICredentialComponent {
  ssx: SSX;
}

const SpruceKitCredentialComponent = ({ ssx }: ICredentialComponent) => {
  const [credentialsList, setCredentialsList] = useState<string[]>([]);
  const [viewingContent, setViewingContent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleGetContent = async (content: string) => {
    setLoading(true);
    try {
      const contentName = content.replace('my-app/', '')
      const { data } = await ssx.credentials.get(contentName);
      setViewingContent(`${content}:\n${JSON.stringify(toCredentialEntry(data), null, 2)}`);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => {
    const getCredentialList = async () => {
      try {
        const credentialListResult = await ssx.credentials?.list?.({ removePrefix: true });
        if (credentialListResult?.data) {
          setCredentialsList(credentialListResult.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    getCredentialList();
  }, [ssx]);

  return (
    <div style={{ marginTop: 25 }}>
      <h2>SpruceKit Credentials</h2>
      <table>
        <tbody>
          {credentialsList?.map((credential, i) => (
            <tr key={i}>
              <td>{credential}</td>
              <td>
                <button
                  onClick={() => handleGetContent(credential)}
                  disabled={loading}
                >
                  <span>
                    GET
                  </span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <pre style={{ marginTop: 25 }}>
        {viewingContent}
      </pre>
    </div>
  );
};

export default SpruceKitCredentialComponent;
```

The following changes in our SSX component at `my-app/components/SSXComponent.tsx` are required to:

- enable the credentials module in our SSX configuration
- import the SpruceKitCredentialComponent we just created
- insert the component alongside our `KeplerStorageComponent` and `RebaseCredentialComponent`

With these changes, the `SSXComponent.tsx` should look like this:
```tsx
"use client";
import { SSX } from "@spruceid/ssx";
import { useState } from "react";
import KeplerStorageComponent from "./KeplerStorageComponent";
import RebaseCredentialComponent from "./RebaseCredentialComponent";
import SpruceKitCredentialComponent from './SpruceKitCredentialComponent'
const SSXComponent = () => {

  const [ssxProvider, setSSX] = useState<SSX | null>(null);

  const ssxHandler = async () => {
    const ssx = new SSX({
      providers: {
        server: {
          host: "http://localhost:3000/api"
        }
      },
      modules: {
        storage: {
          prefix: 'my-app',
          hosts: ['https://kepler.spruceid.xyz'],
          autoCreateNewOrbit: true
        },
        credentials: true
      }
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
            <br />
            <KeplerStorageComponent ssx={ssxProvider} />
            <br />
            <RebaseCredentialComponent ssx={ssxProvider} />
            <br />
            <SpruceKitCredentialComponent ssx={ssxProvider} />
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

Finally, run the app with `npm run dev`. At the bottom of the page, you should see your quest credentials.
