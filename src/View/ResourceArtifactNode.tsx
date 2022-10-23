import { Icon, Stack, Text } from "@fluentui/react";
import { Handle, NodeProps, Position } from "reactflow";
import IResourceArtifact, {
  ResourceVariantTypes,
} from "../Models/interfaces/IResourceArtifact";
const ResourceArtifactNode: React.FunctionComponent<
  NodeProps<IResourceArtifact>
> = ({ data }) => {
  return (
    <>
      <div
        style={{
          background: "#150050",
          display: "flex",
          border: "1px solid black",
          borderRadius: "2px",
          flexDirection: "column",
          padding: "10pt",
          alignItems: "center",
          minWidth: "15vw",
        }}
      >
        <Handle type="target" id="top" position={Position.Top} />
        <Handle
          type="source"
          id="bottom"
          position={Position.Bottom}
          style={{ background: "green" }}
        />

        <div style={{ alignSelf: "start", paddingBottom: "10pt" }}>
          <Text variant="small" style={{ color: "white" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5pt" }}>
              <div>
                {data.ResourceVariant ===
                  ResourceVariantTypes.SECRET_HOLDER && (
                  <Icon style={{ fontSize: "20pt" }} iconName="AzureKeyVault" />
                )}
              </div>
              <div style={{ fontSize: "10pt" }}> {data.ResourceType}</div>
            </div>
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

export default ResourceArtifactNode;
