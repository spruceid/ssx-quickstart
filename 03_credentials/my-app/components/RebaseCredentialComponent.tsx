"use client";
import { toCredentialEntry } from "@/utils/rebase";
import { SSX } from "@spruceid/ssx";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { defaultClientConfig, type Types } from '@spruceid/rebase-client';
import type { AttestationProof, AttestationStatement } from '@spruceid/rebase-client/bindings';

interface IRebaseCredentialComponent {
  ssx: SSX;
}

const RebaseCredentialComponent = ({ ssx }: IRebaseCredentialComponent) => {
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
    let { data } = await ssx.storage.list();
    data = data.filter((d: string) => d.includes('/credentials/'))
    setCredentialList(data);
    setLoading(false);
  };

  const createClient = async () => {
    const Client = (await import('@spruceid/rebase-client')).Client;
    const WasmClient = (await import('@spruceid/rebase-client/wasm')).WasmClient;
    setRebaseClient(new Client(new WasmClient(JSON.stringify(defaultClientConfig()))))
  };

  const createSigner = async () => {
    const ethSigner = await ssx.getSigner();
    setSigner(ethSigner);
  };

  const toSubject = () => {
    return {
      pkh: {
        eip155: {
          address: ssx.address(),
          chain_id: '1'
        }
      }
    }
  };

  const sanityCheck = () => {
    if (!rebaseClient) throw new Error('Rebase client is not configured');
    if (!signer) throw new Error('Signer is not connected');
  };

  const statement = async (credentialType: Types.AttestationTypes, content: any): Promise<string> => {
    sanityCheck();
    const o = {};
    (o as any)[credentialType] = Object.assign({ subject: toSubject() }, content);
    const req: Types.Statements = {
      Attestation: o as AttestationStatement
    };
    const resp = await rebaseClient?.statement(req);
    if (!resp?.statement) {
      throw new Error('No statement found in witness response');
    }
    return resp.statement;
  };

  const witness = async (
    credentialType: Types.AttestationTypes,
    content: any,
    signature: string
  ): Promise<string> => {
    sanityCheck();
    const o = {};
    (o as any)[credentialType] = {
      signature,
      statement: Object.assign({ subject: toSubject() }, content)
    };
    const req: Types.Proofs = {
      Attestation: o as AttestationProof
    };
    const resp = await rebaseClient?.witness_jwt(req);
    if (!resp?.jwt) {
      throw new Error('No jwt found in witness response');
    }
    return resp.jwt;
  };

  const issue = async () => {
    setLoading(true);
    try {
      const fileName = 'credentials/post_' + Date.now();
      const credentialType = 'BasicPostAttestation';
      const content = {
        title,
        body
      }
      const stmt = await statement(credentialType, content);
      const sig = (await signer?.signMessage(stmt)) ?? '';
      const jwt_str = await witness(credentialType, content, sig);
      await ssx.storage.put(fileName, jwt_str);
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
      const { data } = await ssx.storage.get(contentName);
      setViewingContent(`${content}:\n${JSON.stringify(toCredentialEntry(data), null, 2)}`);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDeleteContent = async (content: string) => {
    setLoading(true);
    const contentName = content.replace('my-app/', '')
    await ssx.storage.delete(contentName);
    setCredentialList((prevList) => prevList.filter((c) => c !== content));
    setLoading(false);
  };

  return (
    <div style={{ marginTop: 25 }}>
      <h2>Rebase</h2>
      <p>Input data for credential issuance</p>
      <p style={{ maxWidth: 500, fontSize: 12 }}>
        You can issue a BasicPostAttestation by filling the fields and clicking the button bellow.
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