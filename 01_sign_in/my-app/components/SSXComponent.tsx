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