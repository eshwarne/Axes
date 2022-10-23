import { Text } from "@fluentui/react";
import { Handle, NodeProps, Position } from "reactflow";
import IAuthArtifact, {
  AuthArtifactTypes,
} from "../Models/interfaces/IAuthArtifact";
const AuthArtifactNode: React.FunctionComponent<NodeProps<IAuthArtifact>> = ({
  data,
}) => {
  return (
    <>
      <div
        style={{
          background: "purple",
          display: "flex",
          border: "1px solid black",
          borderRadius: "2px",
          flexDirection: "column",
          padding: "10pt",
          alignItems: "center",
          minWidth: "15vw",
        }}
      >
        {data.AuthType !== AuthArtifactTypes.AAD_USER && (
          <Handle type="target" id="top" position={Position.Top} />
        )}
        <Handle
          type="source"
          id="bottom"
          position={Position.Bottom}
          style={{ background: "green" }}
        />

        <div style={{ alignSelf: "start", paddingBottom: "10pt" }}>
          <Text variant="small" style={{ color: "white" }}>
            {data.AuthType}
          </Text>
        </div>
        <div>
          <Text variant="xLarge" style={{ color: "white" }}>
            {data.Name}
          </Text>
        </div>
        <div>
          <Text style={{ color: "white" }}>
            Tenant: <b>{data.Tenant}</b>
          </Text>
        </div>
      </div>
    </>
  );
};

export default AuthArtifactNode;
