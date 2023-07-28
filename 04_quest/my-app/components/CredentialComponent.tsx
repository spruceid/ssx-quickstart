import { SSX } from "@spruceid/ssx";
import { useEffect, useState } from "react";

interface ICredentialComponent {
  ssx: SSX;
}

const CredentialComponent = ({ ssx }: ICredentialComponent) => {
  const [credentialsList, setCredentialsList] = useState<string[]>([]);

  useEffect(() => {
    const getContentAndCredentialList = async () => {
      try {
        const contentListResult = await ssx.storage.list({ removePrefix: true });
        const credentialListResult = await ssx.credentials?.list?.({ removePrefix: true });

        if (contentListResult?.data) {
          setCredentialsList(contentListResult.data);
        }

        if (credentialListResult?.data) {
          setCredentialsList(credentialListResult.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    getContentAndCredentialList();
  }, [ssx]);

  return (
    <div style={{ marginTop: 25 }}>
      <h2>Credentials</h2>
      <table>
        <tbody>
          {credentialsList?.map((content, i) => (
            <tr key={i}>
              <td>{content}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CredentialComponent;
