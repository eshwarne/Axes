
/**
 * All the working graph algorithms depend on the fact that
the input nodes and edges are a part of reactflow Node and Edges
 * NodeList and EdgeList are the defaults used by reactflow
    We adapt this to AdjacencyList for efficient processing when applying graph traversals
    A directed graph is built for Contstraint Verification
    An undirected graph is built for Graph Keyword Search
**/
import { Edge, Node } from "reactflow"
import { AXEQueryProcessor, ProcessedAxeQuery } from "../AxeQueryProcessor/AxeQueryProcessor"

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
    return adjList
}

/**
 * Traverses Nodes Depth First and Checks if Node matches query string
 * @param adjList The adjacency list representation of the graph
 * @param axeQueryString Axe Query String
 */
const queryGraphWithAXEQuery = (adjList:Record<string, Node[]>, axeQueryString: string):Node[] => {
    let processedAXESQuery = AXEQueryProcessor(axeQueryString)
    let visited = new Set<string>()
    let matchingNodeIds:Node[] = []
    let stack:string[] = []
    Object.keys(adjList).forEach((nodeId) => {
        if(!visited.has(nodeId)){
            stack.push(nodeId)
            while(stack.length !== 0){
                let processingNodeId = stack.pop()
                if(processingNodeId && !visited.has(processingNodeId)){
                    let neighbors = adjList[processingNodeId]
                    visited.add(processingNodeId)
                    neighbors.forEach((neighbor) =>{
                        if(!visited.has(neighbor.id)){
                            if(checkIfNodePassesAXEQueries(neighbor, processedAXESQuery)){
                                    matchingNodeIds.push(neighbor)
                            }
                        }
                    })
                }
            }
        }
    })
    return matchingNodeIds
}
const checkIfNodePassesAXEQueries = (node: Node<any>, processedAxeQuery: ProcessedAxeQuery ):boolean => {
    // TODO: Supporting "AND" and  "OR" operators
    return processedAxeQuery.every((query)=>{
        let EntityInCanvas;
        if(query.Entity === "name") {
            EntityInCanvas = "Name"
        } else if (query.Entity == "tenant"){
            EntityInCanvas = "Tenant"
        } else {
            throw new Error("AXE Query Not supported on Graph")
        }
        if(!node.data[EntityInCanvas]){
            return false
        }
        switch(query.Condition){
            case "=":
            case "==":
            case "===":
               if(node.data[EntityInCanvas] === query.Match){
                    return true
               }
               return false
            case "startswith":
                if((node.data[EntityInCanvas] as string).startsWith(query.Match)){
                    return true
                }
                return false
            case "endswith":
                if((node.data[EntityInCanvas] as string).endsWith(query.Match)){
                    return true
                }
                return false
            case "has":
                if((node.data[EntityInCanvas] as string).includes(query.Match)){
                    return true
                }
                return false
            default:
                return false
        }
    })
}
export {queryGraphWithAXEQuery, representGraphAdjListFrom}