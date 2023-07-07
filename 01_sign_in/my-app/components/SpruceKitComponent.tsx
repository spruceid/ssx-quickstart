"use client";
import { SSX } from "@spruceid/ssx";
import { useState } from "react";

const SpruceKitComponent = () => {

  const [skProvider, setSpruceKit] = useState<SSX | null>(null);

  const spruceKitHandler = async () => {
    const ssx = new SSX({
      providers: {
        server: {
          host: "http://localhost:3000/api"
        }
      },
    });
    await ssx.signIn();
    setSpruceKit(ssx);
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