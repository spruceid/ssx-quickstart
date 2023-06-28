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