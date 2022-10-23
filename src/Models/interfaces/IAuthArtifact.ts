import { Node, NodeProps } from "reactflow";
import IArtifact from "./IArtifact";
export enum AuthArtifactTypes {
    AAD_SG = "AAD Security Group",
    AAD_USER = "AAD User",
    AAD_APP="AAD App",
    CERTIFICATE = "Certificate",
}
export enum AuthVariantType{
    StandAlone, AuthDependent, ResourceDependent
}
interface IAuthArtifact extends IArtifact {
    AuthType: AuthArtifactTypes,
    AuthVariant: AuthVariantType
    Type: "AUTH"
    IS_JIT: boolean
}
export default IAuthArtifact