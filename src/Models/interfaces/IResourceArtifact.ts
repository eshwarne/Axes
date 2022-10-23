import { Node, NodeProps } from "reactflow";
import IArtifact from "./IArtifact";
export enum ResourceArtifactTypes {
    NON_PROD = "Non Production Resource",
    PROD = "Production Resource",
}
export enum ResourceVariantTypes{
    APP = "APP",
    SECRET_HOLDER = "SECRET_HOLDER"
}
interface IResourceArtifact extends IArtifact {
    ResourceType: ResourceArtifactTypes,
    ResourceVariant: ResourceVariantTypes
    Type: "RESOURCE"
}
export default IResourceArtifact