# Implement Storage Module

> This section installs the functionality to store and retrieve data in Kepler.


A completed version of this part can be found in the example repository ([02_storage](https://github.com/spruceid/sprucekit-quickstart/tree/main/02_storage)).

You don't need to install any new dependencies, as Kepler is natively supported by SpruceKit. Run the following to create the new component file:

```bash
touch components/KeplerStorageComponent.tsx
```

Then add the following to `my-app/components/KeplerStorageComponent.tsx` file:
```ts
"use client";
import { SpruceKit } from "@spruceid/sprucekit";
import { useEffect, useState } from "react";

interface IKeplerStorageComponent {
  sk: SpruceKit
}

const KeplerStorageComponent = ({ sk }: IKeplerStorageComponent) => {

  const [key, setKey] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [contentList, setContentList] = useState<Array<string>>([]);
  const [viewingContent, setViewingContent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    getContentList();
  }, []);

  const getContentList = async () => {
    setLoading(true);
    let { data } = await sk.storage.list();
    data = data.filter((d: string) => d.includes('/content/'))
    setContentList(data);
    setLoading(false);
  };

  const handlePostContent = async (key: string, value: string) => {
    if (!key || !value) {
      alert('Invalid key or value');
      return;
    }
    const formatedKey = 'content/' + key.replace(/\ /g, '_');
    setLoading(true);
    await sk.storage.put(formatedKey, value);
    setContentList((prevList) => [...prevList, `my-app/${formatedKey}`]);
    setKey('');
    setValue('');
    setLoading(false);
  };

  const handleGetContent = async (content: string) => {
    setLoading(true);
    const contentName = content.replace('my-app/', '')
    const { data } = await sk.storage.get(contentName);
    setViewingContent(`${content}:\n${data}`);
    setLoading(false);
  };

  const handleDeleteContent = async (content: string) => {
    setLoading(true);
    const contentName = content.replace('my-app/', '')
    await sk.storage.delete(contentName);
    setContentList((prevList) => prevList.filter((c) => c !== content));
    setLoading(false);
  };

  return (
    <div style={{ marginTop: 50 }}>
      <h2>Storage Module</h2>
      <p>Store your data in Kepler Orbit</p>
      <p style={{ maxWidth: 500, fontSize: 12 }}>
        Kepler is a decentralized <b>key-value</b> storage system that uses DIDs and Authorization Capabilities to define Orbits,
        where your data lives, and who has access. In this example we will store a value (string) indexed by a key (string).
      </p>
      <input
        type="text"
        placeholder="Key"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        disabled={loading}
      />
      <br />
      <input
        type="text"
        placeholder="Value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={loading}
      />
      <br />
      <button
        onClick={() => handlePostContent(key, value)}
        disabled={loading}
        style={{ marginTop: 15 }}
      >
        <span>
          POST
        </span>
      </button>
      <p><b>My Kepler data</b></p>
      <table>
        <tbody>
          {contentList?.map((content, i) => <tr key={i}>
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
      <pre style={{ marginTop: 25, marginBottom: 0 }}>
        {viewingContent}
      </pre>
    </div>
  );
}

export default KeplerStorageComponent;
```

Now update the SpruceKitComponent to import the storage component module by adding the following into `my-app/components/SpruceKitComponent.tsx` file:

```ts
"use client";
import { SpruceKit } from "@spruceid/sprucekit";
import { useState } from "react";
import KeplerStorageComponent from "./KeplerStorageComponent";

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

That's it! Now you can run the app by using:

```bash
npm run dev
```