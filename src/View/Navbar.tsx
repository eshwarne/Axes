import {
  DefaultButton,
  Dropdown,
  DropdownMenuItemType,
  IconButton,
  IDropdownOption,
  IDropdownProps,
  Label,
  SearchBox,
  Stack,
  Text,
} from "@fluentui/react";
import * as CryptoJS from "crypto-js";
import { Edge, Node } from "reactflow";
import IAuthArtifact, {
  AuthArtifactTypes,
  AuthVariantType,
} from "../Models/interfaces/IAuthArtifact";
import IResourceArtifact, {
  ResourceArtifactTypes,
  ResourceVariantTypes,
} from "../Models/interfaces/IResourceArtifact";
import { JsonCryptoFormatter } from "../Utils/CryptoUtils";
let AuthArtifactEmpty: IAuthArtifact = {
  AuthType: AuthArtifactTypes.AAD_USER,
  AuthVariant: AuthVariantType.StandAlone,
  Name: "",
  Tenant: "",
  Type: "AUTH",
  IS_JIT: false,
};
let ResourceArtifactEmpty: IResourceArtifact = {
  Name: "",
  ResourceType: ResourceArtifactTypes.NON_PROD,
  ResourceVariant: ResourceVariantTypes.APP,
  Tenant: "",
  Type: "RESOURCE",
};
const exampleOptions: IDropdownOption[] = [
  {
    key: "authArtifacts",
    text: "Auth Artifacts",
    itemType: DropdownMenuItemType.Header,
  },
  { key: "AUTH_AAD_APP", text: "AAD App Registration" },
  { key: "AUTH_AAD_SG", text: "AAD Security Group" },
  { key: "AUTH_AAD_USER", text: "AAD User" },
  { key: "AUTH_CERTIFICATE", text: "Certificate" },
  { key: "divider_2", text: "-", itemType: DropdownMenuItemType.Divider },
  {
    key: "resourceArtifacts",
    text: "Resource Artifacts",
    itemType: DropdownMenuItemType.Header,
  },
  {
    key: "RESOURCE_PROD",
    text: "Production Resource",
  },
  {
    key: "RESOURCE_NON_PROD",
    text: "Non-Production Resource",
  },
];
const dropdownStyles = { dropdown: { width: 300 } };
const onRenderLabel = (props: any) => {
  return (
    <Stack horizontal verticalAlign="center">
      <Label>{props.label}</Label>
    </Stack>
  );
};

const Navbar = ({
  setQueryString,
  setSelectedArtifact,
  setIsOpenModal,
  nodes,
  edges,
  getPrivateKey,
  setNodes,
  setEdges,
}: {
  setQueryString: (arg0: string) => void;
  setSelectedArtifact: (
    arg0: IResourceArtifact | IAuthArtifact | undefined
  ) => void;
  setIsOpenModal: (arg0: boolean) => void;
  nodes: Node[];
  edges: Edge[];
  getPrivateKey: (
    notifier: (argo0: string) => void,
    isUpload?: boolean
  ) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
}) => {
  const getAuthArtifactType = (artifactTypeKey: string): AuthArtifactTypes => {
    switch (artifactTypeKey) {
      case "AUTH_SG":
        return AuthArtifactTypes.AAD_SG;
      case "AUTH_AAD_APP":
        return AuthArtifactTypes.AAD_APP;
      case "AUTH_AAD_USER":
        return AuthArtifactTypes.AAD_USER;
      case "AUTH_CERTIFICATE":
        return AuthArtifactTypes.CERTIFICATE;
      default:
        return AuthArtifactTypes.AAD_SG;
    }
  };
  const getResourceArtifactType = (
    artifactTypeKey: string
  ): ResourceArtifactTypes => {
    switch (artifactTypeKey) {
      case "RESOURCE_PROD":
        return ResourceArtifactTypes.PROD;
      case "RESOURCE_NON_PROD":
        return ResourceArtifactTypes.NON_PROD;
      default:
        return ResourceArtifactTypes.PROD;
    }
  };
  const onArtifactChange = (
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption<any> | undefined,
    index?: number | undefined
  ) => {
    setQueryString("");
    if (option) {
      if (option.key.toString().startsWith("AUTH")) {
        setSelectedArtifact({
          ...AuthArtifactEmpty,
          AuthType: getAuthArtifactType(option.key.toString()),
        });
        setIsOpenModal(true);
      } else if (option.key.toString().startsWith("RESOURCE")) {
        setSelectedArtifact({
          ...ResourceArtifactEmpty,
          ResourceType: getResourceArtifactType(option.key.toString()),
        });
        setIsOpenModal(true);
      }
    }
  };
  const encryptNodesWithPrivateKeyAndMakeFile = async (privateKey: string) => {
    let encryptedContent = CryptoJS.AES.encrypt(
      JSON.stringify({ nodes, edges }),
      privateKey
    );

    const fileHandler = await window.showSaveFilePicker({
      suggestedName: "AccessList.AXES",
      types: [
        {
          description: "AXES files",
          accept: {
            "text/plain": [".AXES"],
          },
        },
      ],
    });
    const fileStream = await fileHandler.createWritable();
    await fileStream.write(
      new Blob([encryptedContent.toString()], {
        type: "text/plain",
      })
    );
    await fileStream.close();
  };
  const decryptNodesWithPrivateKeyAndMakeCanvas = async (
    privateKey: string
  ) => {
    const [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const contents = await file.text();
    try {
      const canvas = JSON.parse(
        CryptoJS.AES.decrypt(contents, privateKey).toString(CryptoJS.enc.Utf8)
      );
      if (canvas?.nodes && canvas?.edges) {
        setNodes(canvas.nodes);
        setEdges(canvas.edges);
      } else {
        window.alert("You have uploaded an corrupted AXES file");
      }
    } catch (error) {
      window.alert(
        "You have uploaded some invalid file, please upload valid AXES file only."
      );
    }
  };
  return (
    <Stack style={{ marginInline: "5vw" }}>
      <div style={{ alignSelf: "center" }}>
        <Text variant="xxLargePlus">Axes 🪓</Text>
      </div>
      <div style={{ alignSelf: "center" }}>
        <Text variant="large">Add Access and Find Axes</Text>
      </div>
      <Text
        variant="medium"
        style={{ fontWeight: "bold", paddingBottom: "4pt" }}
      >
        Search Artifact Relationship
      </Text>
      <div
        style={{
          display: "flex",
          gap: "20pt",
          justifyContent: "space-between",
        }}
      >
        <SearchBox
          style={{ minWidth: "30vw" }}
          placeholder="Search for an artifact and get it's relationship with other artifacts"
          onSearch={(newValue) => setQueryString(newValue)}
          onClear={() => {
            setQueryString("");
          }}
        />
        <div style={{ display: "flex", gap: "20pt" }}>
          <DefaultButton
            onClick={async () => {
              getPrivateKey(encryptNodesWithPrivateKeyAndMakeFile);
            }}
          >
            Download AXES File
          </DefaultButton>
          <DefaultButton
            onClick={async () => {
              getPrivateKey(decryptNodesWithPrivateKeyAndMakeCanvas, true);
            }}
          >
            Open AXES File
          </DefaultButton>
        </div>
      </div>
      <Dropdown
        selectedKey={""}
        placeholder="Add an artifact from list"
        label="Add Artifact"
        ariaLabel="Select an artifact from dropdown"
        styles={dropdownStyles}
        options={exampleOptions}
        onRenderLabel={onRenderLabel}
        onChange={onArtifactChange}
      />
    </Stack>
  );
};

export default Navbar;
