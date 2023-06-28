
# Integrate Rebase

> This section integrates the functionality to generate a credential via Rebase.


A completed version of this part can be found in the example repository ([03_rebase](https://github.com/spruceid/sprucekit-quickstart/tree/main/03_credentials)).

In this step, you must install Rebase as a new dependency, as it is not yet supported by SpruceKit. Run the following to add the dependency and create the new component file:

```bash
npm i @rebase-xyz/rebase-client@^0.9.1 ethers@5.7.2
mkdir utils
touch utils/rebase.ts \
      components/RebaseCredentialComponent.tsx
```

You need to update the NextConfig to support WebAssembly. Add the following to `my-app/next.config.js` file:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    config.experiments.asyncWebAssembly = true;
    return config
  },
}

module.exports = nextConfig
```

Add the following to `my-app/utils/rebase.ts` to add some util methods of Rebase to the project:

```ts
export interface BasicPostCredential {
  type: "WitnessedBasicPost", // The URN of the UUID of the credential.
  id: string, // The DID of the user who is the credential subject, comes from the VC.credentialSubject.id
  subject: string,
  title: string,
  body: string,
}

export const encode = (c: string): string => {
  return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
};

export const parseJWT = (jwt_str: string): any => {
  const v = jwt_str.split('.');
  if (v.length !== 3) throw new Error('Invalid JWT format');
  const u = v[1];
  const b64 = u.replace(/-/g, '+').replace(/_/g, '/');
  const encoded = atob(b64).split('').map(encode).join('');
  const json_str = decodeURIComponent(encoded);
  return JSON.parse(json_str);
};

export const toCredentialContent = (jwt_str: string): Record<string, any> | void => {
  const parsed = parseJWT(jwt_str);
  const vc = parsed?.vc;
  if (!vc) throw new Error('Malformed jwt, no vc property');
  const t = vc?.type;
  if (!t) throw new Error('Malformed credential, no type property');
  if (t.length !== 2) throw new Error('Malformed credential, type property did not have length of 2');
  const credType = t[1];
  if (credType !== 'WitnessedBasicPost') throw new Error(`Unsupported Credential Type: ${credType}`);
  const credID = vc?.id;
  if (!credID) throw new Error('No id property found under vc property in JWT credential');
  const subjID = vc?.credentialSubject?.id;
  if (!subjID) throw new Error('No id property found under vc.credentialSubject property in JWT credential');
  const issuanceDate = vc?.issuanceDate;
  if (!issuanceDate) throw new Error('No issuanceDate property found under vc property in JWT credential');
  const c = {
    type: credType,
    id: credID,
    subject: subjID,
    issuanceDate
  };
  switch (credType) {
    case "WitnessedBasicPost": {
      let next = {
        title: getCredSubjProp("title", vc),
        body: getCredSubjProp("body", vc)
      };
      try {
        let reply_to = getCredSubjProp("reply_to", vc);
        next = Object.assign({}, next, { reply_to });
      } catch (_e) { }
      return Object.assign({}, c, next) as BasicPostCredential;
    }
  }
};

export const toCredentialEntry = (jwt_str: string): Record<string, any> => {
  const content = toCredentialContent(jwt_str);
  return { jwt: jwt_str, content: content };
};

const getCredSubjProp = (prop: string, vc: any): any => {
  let x = vc?.credentialSubject[prop];
  if (!x) throw new Error(`No ${prop} property found under vc.credentialSubject property in JWT credential`)
  return x;
}
```

Then, add the following into `my-app/components/RebaseCredentialComponent.tsx`:

```ts
"use client";
import { toCredentialEntry } from "@/utils/rebase";
import { SpruceKit } from "@spruceid/sprucekit";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

const REBASE_URL_BASE = 'https://rebasedemo.spruceid.workers.dev';
const endpoints = {
  instructions: `${REBASE_URL_BASE}/instructions`,
  statement: `${REBASE_URL_BASE}/statement`,
  jwt: `${REBASE_URL_BASE}/witness`,
  verify_jwt: `${REBASE_URL_BASE}/verify`
};

interface IRebaseCredentialComponent {
  sk: SpruceKit;
}

const RebaseCredentialComponent = ({ sk }: IRebaseCredentialComponent) => {
  const [rebaseClient, setRebaseClient] = useState<any>();
  const [signer, setSigner] = useState<ethers.Signer>();
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [credentialList, setCredentialList] = useState<Array<string>>([]);
  const [viewingContent, setViewingContent] = useState<string | null>(null);

  useEffect(() => {
    getContentList();
    createClient();
    createSigner();
  }, []);

  const getContentList = async () => {
    setLoading(true);
    let { data } = await sk.storage.list();
    data = data.filter((d: string) => d.includes('/credentials/'))
    setCredentialList(data);
    setLoading(false);
  };

  const createClient = async () => {
    const Client = (await import('@rebase-xyz/rebase-client')).Client;
    setRebaseClient(new Client(JSON.stringify(endpoints)))
  };

  const createSigner = async () => {
    const ethSigner = await sk.getSigner();
    setSigner(ethSigner);
  };

  const toSubject = () => {
    return {
      pkh: {
        eip155: {
          address: sk.address(),
          chain_id: '1'
        }
      }
    }
  };

  const sanityCheck = () => {
    if (!rebaseClient) throw new Error('Rebase client is not configured');
    if (!signer) throw new Error('Signer is not connected');
  };

  const statement = async (credentialType: string, content: any): Promise<string> => {
    sanityCheck();
    const req: Record<string, any> = {
      opts: {
        WitnessedSelfIssued: {}
      }
    };
    req.opts.WitnessedSelfIssued[credentialType] = Object.assign({ subject: toSubject() }, content);
    const j = JSON.stringify(req);
    const resp = await rebaseClient?.statement(j);
    const respBody = JSON.parse(resp);
    if (!respBody.statement) throw new Error('No statement found in witness response');
    return respBody.statement;
  };

  const witness = async (
    credentialType: string,
    content: any,
    signature: string
  ): Promise<string> => {
    sanityCheck();
    const req: Record<string, any> = {
      proof: {
        WitnessedSelfIssued: {}
      }
    };
    req.proof.WitnessedSelfIssued[credentialType] = {
      signature,
      statement: Object.assign({ subject: toSubject() }, content)
    };
    const j = JSON.stringify(req);
    const resp = await rebaseClient?.jwt(j);
    const respBody = JSON.parse(resp);
    if (!respBody.jwt) throw new Error('No jwt found in witness response');
    return respBody.jwt;
  };

  const issue = async () => {
    setLoading(true);
    try {
      const fileName = 'credentials/post_' + Date.now();
      const credentialType = 'WitnessedBasicPost';
      const content = {
        title,
        body
      }
      const stmt = await statement(credentialType, content);
      const sig = (await signer?.signMessage(stmt)) ?? '';
      const jwt_str = await witness(credentialType, content, sig);
      await sk.storage.put(fileName, jwt_str);
      setCredentialList((prevList) => [...prevList, `my-app/${fileName}`]);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleGetContent = async (content: string) => {
    setLoading(true);
    try {
      const contentName = content.replace('my-app/', '')
      const { data } = await sk.storage.get(contentName);
      setViewingContent(`${content}:\n${JSON.stringify(toCredentialEntry(data), null, 2)}`);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDeleteContent = async (content: string) => {
    setLoading(true);
    const contentName = content.replace('my-app/', '')
    await sk.storage.delete(contentName);
    setCredentialList((prevList) => prevList.filter((c) => c !== content));
    setLoading(false);
  };

  return (
    <div style={{ marginTop: 25 }}>
      <h2>Rebase</h2>
      <p>Input data for credential issuance</p>
      <p style={{ maxWidth: 500, fontSize: 12 }}>
        You can issue a WitnessedBasicPost by filling the fields and clicking the button bellow.
        Title and body can be any string.
      </p>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
      />
      <br />
      <input
        type="text"
        placeholder="Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={loading}
      />
      <br />
      <button
        onClick={issue}
        disabled={loading}
        style={{ marginTop: 15 }}
      >
        <span>
          ISSUE AND POST
        </span>
      </button>
      <p><b>My credentials</b></p>
      <table>
        <tbody>
          {credentialList?.map((content, i) => <tr key={i}>
            <td>
              {content}
            </td>
            <td>
              <button
                onClick={() => handleGetContent(content)}
                disabled={loading}
              >
                <span>
                  GET
                </span>
              </button>
            </td>
            <td>
              <button
                onClick={() => handleDeleteContent(content)}
                disabled={loading}
              >
                <span>
                  DELETE
                </span>
              </button>
            </td>
          </tr>)}
        </tbody>
      </table>
      <pre style={{ marginTop: 25 }}>
        {viewingContent}
      </pre>
    </div>
  );
}

export default RebaseCredentialComponent;
```

Now update the SpruceKitComponent to import the credential component module by adding the following into `my-app/components/SpruceKitComponent.tsx`:

```ts
"use client";
import { SpruceKit } from "@spruceid/sprucekit";
import { useState } from "react";
import KeplerStorageComponent from "./KeplerStorageComponent";
import RebaseCredentialComponent from "./RebaseCredentialComponent";

const SpruceKitComponent = () => {

  const [skProvider, setSpruceKit] = useState<SpruceKit | null>(null);

  const spruceKitHandler = async () => {
    const sk = new SpruceKit({
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
        }
      }
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
            <br />
            <KeplerStorageComponent sk={skProvider} />
            <br />
            <RebaseCredentialComponent sk={skProvider} />
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

Finally, you can run the app by using:

```bash
npm run dev
```