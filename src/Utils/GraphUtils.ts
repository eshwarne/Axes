
/**
 * All the working graph algorithms depend on the fact that
the input nodes and edges are a part of reactflow Node and Edges
 * NodeList and EdgeList are the defaults used by reactflow
    We adapt this to AdjacencyList for efficient processing when applying graph traversals
    A directed graph is built for Contstraint Verification
    An undirected graph is built for Graph Keyword Search
**/
import { Edge, Node } from "reactflow"

/**
 * 
 * @param nodes Nodes in the canvas
 * @param edges Edges that connect the nodes in the canvas
 * @param isDirected Make an undirected graph adjacency list
 */
const representGraphAdjListFrom = (nodes:Node[], edges:Edge[], isDirected?:boolean) => {
    let nodeIdToNodeMap:Record<string, Node> = {}
    let adjList: Record<string, Node[]> = {}
    nodes.forEach(node => {
        adjList[node.id]=[]
        nodeIdToNodeMap[node.id] = node
    })
    edges.forEach((edge) =>{
        edge.target && adjList[edge.source]?.push(nodeIdToNodeMap[edge.target])
        if(isDirected){
            edge.source && adjList[edge.target]?.push(nodeIdToNodeMap[edge.source])
        }
    })
}
export {representGraphAdjListFrom}