import { SSX } from "@spruceid/ssx";
import { useEffect, useState } from "react";

interface ICredentialComponent {
  ssx: SSX;
}

const QuestCredentialComponent = ({ ssx }: ICredentialComponent) => {
  const [credentialsList, setCredentialsList] = useState<string[]>([]);

  useEffect(() => {
    const getCredentialList = async () => {
      try {
        const credentialListResult = await ssx.credentials?.list?.({ removePrefix: true });
        console.log(credentialListResult)

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
      <h2>Quest Credentials</h2>
      <table>
        <tbody>
          {credentialsList?.map((credential, i) => (
            <tr key={i}>
              <td>{credential}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuestCredentialComponent;
