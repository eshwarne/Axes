/**
 * All the working graph algorithms depend on the fact that
the input nodes and edges are a part of reactflow Node and Edges
 * NodeList and EdgeList are the defaults used by reactflow
    We adapt this to AdjacencyList for efficient processing when applying graph traversals
    A directed graph is built for Contstraint Verification
    An undirected graph is built for Graph Keyword Search
**/
import { Edge, Node } from "reactflow";
import {
  AXEQueryProcessor,
  ProcessedAxeQuery,
} from "../AxeQueryProcessor/AxeQueryProcessor";

/**
 *
 * @param nodes Nodes in the canvas
 * @param edges Edges that connect the nodes in the canvas
 * @param isDirected Make an undirected graph adjacency list
 */
const representGraphAdjListFrom = (
  nodes: Node[],
  edges: Edge[],
  isDirected?: boolean
) => {
  let nodeIdToNodeMap: Record<string, Node> = makeNodeIdToNodeMap(nodes);
  let adjList: Record<string, Node[]> = {};
  nodes.forEach((node) => {
    adjList[node.id] = [];
  });
  edges.forEach((edge) => {
    edge.target && adjList[edge.source]?.push(nodeIdToNodeMap[edge.target]);
    if (!isDirected) {
      edge.source && adjList[edge.target]?.push(nodeIdToNodeMap[edge.source]);
    }
  });
  return adjList;
};

/**
 * Traverses Nodes Depth First and Checks if Node matches query string with its relationship
 * @param adjList The directed adjacency list representation of the graph
 * @param axeQueryString Axe Query String
 */
const queryGraphWithAXEQuery = (
  adjList: Record<string, Node[]>,
  axeQueryString: string,
  nodeIdToNodeMap: Record<string, Node>
): Node[] => {
  let processedAXESQuery = AXEQueryProcessor(axeQueryString);
  let matchedNodes = Object.values(nodeIdToNodeMap)
    .filter((node) => checkIfNodePassesAXEQueries(node, processedAXESQuery))
    .map((node) => node.id);
  let visited = new Set<string>();
  let relatedNodes: Node[] = [];
  let stack: string[] = [];
  console.log("AXEQUERY_PROCESSING_GRAPH", adjList);
  console.log("AXEQUERY_PROCESSING_GRAPH", matchedNodes);
  matchedNodes.forEach((nodeId) => {
    if (!visited.has(nodeId)) {
      stack.push(nodeId);
      while (stack.length !== 0) {
        let processingNodeId = stack.pop();
        if (processingNodeId && !visited.has(processingNodeId)) {
          let neighbors = adjList[processingNodeId];
          visited.add(processingNodeId);
          relatedNodes.push(nodeIdToNodeMap[processingNodeId]);
          neighbors.forEach((neighbor) => {
            if (!visited.has(neighbor.id)) {
              stack.push(neighbor.id);
            }
          });
        }
      }
    }
  });
  console.log("AXEQUERY_PROCESSING_GRAPH", relatedNodes);
  return relatedNodes;
};

/**
 *
 * @param node the node to check
 * @param processedAxeQuery the AXES query to run against the node
 * @returns boolean true if match
 */
const checkIfNodePassesAXEQueries = (
  node: Node<any>,
  processedAxeQuery: ProcessedAxeQuery
): boolean => {
  // TODO: Supporting "AND" and  "OR" operators
  console.log(node, processedAxeQuery);
  return processedAxeQuery.every((query) => {
    let EntityInCanvas;
    if (query.Entity === "name") {
      EntityInCanvas = "Name";
    } else if (query.Entity == "tenant") {
      EntityInCanvas = "Tenant";
    } else {
      EntityInCanvas = "error";
    }

    if (!node.data[EntityInCanvas]) {
      return false;
    }
    switch (query.Condition.trim()) {
      case "=":
      case "==":
      case "===":
        console.log("==", query);
        if (node.data[EntityInCanvas].toLowerCase() === query.Match) {
          return true;
        }
        return false;
      case "startswith":
        if (
          (node.data[EntityInCanvas] as string)
            .toLowerCase()
            .startsWith(query.Match)
        ) {
          return true;
        }
        return false;
      case "endswith":
        if (
          (node.data[EntityInCanvas] as string)
            .toLowerCase()
            .endsWith(query.Match)
        ) {
          return true;
        }
        return false;
      case "has":
        if (
          (node.data[EntityInCanvas] as string)
            .toLowerCase()
            .includes(query.Match)
        ) {
          return true;
        }
        return false;
      default:
        return false;
    }
  });
};

const makeNodeIdToNodeMap = (nodes: Node[]): Record<string, Node> => {
  let map: Record<string, Node> = {};
  nodes.forEach((node) => (map[node.id] = node));
  return map;
};
export {
  makeNodeIdToNodeMap,
  queryGraphWithAXEQuery,
  representGraphAdjListFrom,
};
