import React from "react"
import { Node, NodeProps } from "reactflow"

interface IArtifact{
    Name: string,
    Tenant: string
    Type: "AUTH" | "RESOURCE"
}
export default IArtifact