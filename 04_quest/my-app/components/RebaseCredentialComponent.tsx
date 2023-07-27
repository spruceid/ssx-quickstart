import { SSX } from "@spruceid/ssx";
import { useEffect, useState } from "react";

interface ICredentialComponent {
  ssx: SSX;
}

const CredentialComponent = ({ ssx }: ICredentialComponent) => {
  const [contentList, setContentList] = useState<Array<string>>([]);
  const [credentialsList, setCredentialsList] = useState<Array<string>>([]);
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [viewingContent, setViewingContent] = useState<string | null>(null);

  useEffect(() => {
    const getContentList = async () => {
      const { data } = await ssx.storage.list({ removePrefix: true });
      setContentList(data);
    };
    const getCredentialList = async () => {
      const { data } = await ssx.credentials?.list?.({ removePrefix: true });
      setCredentialsList(data);
    };
    getContentList();
    getCredentialList();
  }, [ssx]);


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

export default CredentialComponent;