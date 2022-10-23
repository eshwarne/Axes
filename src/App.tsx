import { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Connection,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import IAuthArtifact, {
  AuthArtifactTypes,
} from "./Models/interfaces/IAuthArtifact";
import AuthArtifactNode from "./View/AuthArtifactNode";
import Navbar from "./View/Navbar";
import {
  Checkbox,
  DefaultButton,
  initializeIcons,
  Modal,
  Stack,
  Text,
  TextField,
} from "@fluentui/react";
import IResourceArtifact, {
  ResourceVariantTypes,
} from "./Models/interfaces/IResourceArtifact";
import ResourceArtifactNode from "./View/ResourceArtifactNode";
import {
  makeNodeIdToNodeMap,
  queryGraphWithAXEQuery,
  representGraphAdjListFrom,
} from "./Utils/GraphUtils";

initializeIcons();
const NodeToArtifactMap = {
  authArtifactNode: AuthArtifactNode,
  resourceArtifactNode: ResourceArtifactNode,
};
const canvasWidth =
  Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) -
  100;
const canvasHeight =
  Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0
  ) - 100;

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];
function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isPrivateKeyModalOpen, setIsPrivateKeyModalOpen] = useState(false);
  const [isUpload, setIsUpload] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  let privateKeyResolver = useRef<any>();
  const [nodeIdToNodeMap, setNodeIdToNodeMap] =
    useState<Record<string, Node>>();
  useEffect(() => {
    setNodeIdToNodeMap({ ...makeNodeIdToNodeMap(nodes) });
  }, [nodes]);
  const [queryString, setQueryString] = useState<string>("");
  const [currentSelectedArtifact, setCurrentSelectedArtifact] = useState<
    IAuthArtifact | IResourceArtifact
  >();
  useState<IResourceArtifact>();
  const [isModalOpen, setIsOpenModal] = useState<boolean>();
  const adjList = representGraphAdjListFrom(nodes, edges, false);
  const filterNodes = useCallback(() => {
    if (queryString.length < 3) {
      return [...nodes];
    } else {
      return queryGraphWithAXEQuery(
        adjList,
        queryString,
        nodeIdToNodeMap ?? {}
      );
    }
  }, [queryString, adjList]);
  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => {
        let sourceNode =
          nodeIdToNodeMap && nodeIdToNodeMap[connection.source ?? ""];

        let isConnectionAnimated =
          sourceNode?.type === "authArtifactNode" && sourceNode.data.IS_JIT;
        let accessType =
          sourceNode?.type === "authArtifactNode" && sourceNode.data.IS_JIT
            ? "has JIT access"
            : "has access";
        let connectionEdge: Edge = {
          source: connection.source ?? "",
          target: connection.target ?? "",
          id: (connection.source ?? "") + "-" + (connection.target ?? ""),
          label: accessType,
          markerEnd: {
            type: MarkerType.Arrow,
            strokeWidth: 10,
            height: 40,
          },
          animated: isConnectionAnimated,
        };
        return addEdge(connectionEdge, eds);
      }),
    [setEdges, nodeIdToNodeMap]
  );
  const hideModal = () => {
    setIsOpenModal(false);
  };
  const getPrivateKey = (
    callback: (privateKey: string) => void,
    isUpload?: boolean
  ) => {
    if (isUpload) {
      setIsUpload(true);
    }
    privateKeyResolver.current = callback;
    setIsPrivateKeyModalOpen(true);
  };
  return (
    <div>
      <Navbar
        setQueryString={setQueryString}
        setSelectedArtifact={setCurrentSelectedArtifact}
        setIsOpenModal={setIsOpenModal}
        edges={edges}
        nodes={nodes}
        getPrivateKey={getPrivateKey}
        setEdges={setEdges}
        setNodes={setNodes}
      />
      <div className="App" style={{ height: canvasHeight, width: canvasWidth }}>
        <ReactFlow
          nodeTypes={NodeToArtifactMap}
          nodes={filterNodes()}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      <Modal isOpen={isModalOpen} isBlocking={false} onDismiss={hideModal}>
        {currentSelectedArtifact?.Type === "AUTH" && (
          <Stack style={{ padding: "50pt", width: "50vw" }}>
            <Text variant="large">
              Add {(currentSelectedArtifact as IAuthArtifact).AuthType}
            </Text>
            <TextField
              label="Name"
              onChange={(e, value) => {
                setCurrentSelectedArtifact({
                  ...currentSelectedArtifact,
                  Name: value ?? "",
                });
              }}
              value={(currentSelectedArtifact as IAuthArtifact).Name}
            />
            <TextField
              label="Tenant Name"
              onChange={(e, value) => {
                setCurrentSelectedArtifact({
                  ...currentSelectedArtifact,
                  Tenant: value ?? "",
                });
              }}
              value={(currentSelectedArtifact as IAuthArtifact).Tenant}
            />
            <br />
            {currentSelectedArtifact.AuthType === AuthArtifactTypes.AAD_SG && (
              <Checkbox
                onChange={(ev, checked) => {
                  setCurrentSelectedArtifact({
                    ...currentSelectedArtifact,
                    IS_JIT: checked || true,
                  });
                }}
                label="Is JIT (Just In Time) enabled Group?"
                checked={currentSelectedArtifact.IS_JIT}
              />
            )}
            <br />
            <DefaultButton
              primary
              onClick={() => {
                setNodes((nodes) => {
                  return [
                    ...nodes,
                    {
                      id:
                        currentSelectedArtifact.AuthType +
                        "/" +
                        currentSelectedArtifact.Tenant +
                        "/" +
                        currentSelectedArtifact.Name,
                      position: {
                        x: Math.random() * canvasWidth * 0.5,
                        y: Math.random() * canvasHeight * 0.5,
                      },
                      data: {
                        Name: currentSelectedArtifact.Name,
                        AuthType: currentSelectedArtifact.AuthType,
                        AuthVariant: currentSelectedArtifact.AuthVariant,
                        Tenant: currentSelectedArtifact.Tenant,
                        IS_JIT: currentSelectedArtifact.IS_JIT,
                      },
                      type: "authArtifactNode",
                    },
                  ];
                });
                hideModal();
              }}
            >
              Create {(currentSelectedArtifact as IAuthArtifact).AuthType} node
            </DefaultButton>
          </Stack>
        )}
        {currentSelectedArtifact?.Type === "RESOURCE" && (
          <Stack style={{ padding: "50pt", width: "50vw" }}>
            <Text variant="large">
              Add {(currentSelectedArtifact as IResourceArtifact).ResourceType}
            </Text>
            <TextField
              label="Name"
              onChange={(e, value) => {
                setCurrentSelectedArtifact({
                  ...currentSelectedArtifact,
                  Name: value ?? "",
                });
              }}
              value={(currentSelectedArtifact as IResourceArtifact).Name}
            />
            <TextField
              label="Tenant name"
              onChange={(e, value) => {
                setCurrentSelectedArtifact({
                  ...currentSelectedArtifact,
                  Tenant: value ?? "",
                });
              }}
              value={(currentSelectedArtifact as IResourceArtifact).Tenant}
            />
            <br />
            <Checkbox
              onChange={(ev, checked) => {
                setCurrentSelectedArtifact({
                  ...currentSelectedArtifact,
                  ResourceVariant: ResourceVariantTypes.SECRET_HOLDER,
                });
              }}
              label="Resource holds a secret? (Resources like KeyVault holds a secret)"
              checked={
                (currentSelectedArtifact as IResourceArtifact)
                  .ResourceVariant === ResourceVariantTypes.SECRET_HOLDER
              }
            />
            <br />
            <DefaultButton
              primary
              onClick={() => {
                setNodes((nodes) => {
                  return [
                    ...nodes,
                    {
                      id:
                        currentSelectedArtifact.ResourceType +
                        "/" +
                        currentSelectedArtifact.Tenant +
                        "/" +
                        currentSelectedArtifact.Name,
                      position: {
                        x: Math.random() * canvasWidth * 0.5,
                        y: Math.random() * canvasHeight * 0.5,
                      },
                      data: {
                        Name: currentSelectedArtifact.Name,
                        ResourceType: currentSelectedArtifact.ResourceType,
                        ResourceVariant:
                          currentSelectedArtifact.ResourceVariant,
                        Tenant: currentSelectedArtifact.Tenant,
                      },
                      type: "resourceArtifactNode",
                    },
                  ];
                });
                hideModal();
              }}
            >
              Create{" "}
              {(currentSelectedArtifact as IResourceArtifact).ResourceType} node
            </DefaultButton>
          </Stack>
        )}
      </Modal>
      <Modal
        isOpen={isPrivateKeyModalOpen}
        onDismiss={() => {
          setIsPrivateKeyModalOpen(false);
        }}
      >
        <Stack style={{ padding: "50pt", width: "50vw", gap: "10pt" }}>
          <TextField
            label={
              isUpload
                ? "Private key to decrypt file (Ask the one who shared the file with you)"
                : "Private Key to Encrypt File (We do not save this Key and it's your responsibility to remember it)"
            }
            onChange={(e, value) => {
              setPrivateKey(value ?? "");
            }}
          />
          <DefaultButton
            onClick={() => {
              setIsPrivateKeyModalOpen(false);

              privateKeyResolver.current(privateKey);
            }}
          >
            {isUpload ? "Load DECRYPTED AXES" : "SAVE ENCRYPTED AXES"}
          </DefaultButton>
        </Stack>
      </Modal>
    </div>
  );
}

export default App;
