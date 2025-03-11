"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { KnowledgeGraphData, KnowledgeGraphNode, KnowledgeGraphLink } from "@/lib/courses/types";
import GraphControls from "./graph-controls";
import ConceptDetails from "./concept-details";
import { Card } from "@/components/ui/card";

// Extended type for D3 simulation nodes
interface SimulationNode extends KnowledgeGraphNode {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
  index?: number;
}

// Extended type for D3 simulation links
interface SimulationLink extends KnowledgeGraphLink {
  source: SimulationNode | string;
  target: SimulationNode | string;
}

interface GraphVisualizationProps {
  data: KnowledgeGraphData;
}

export default function GraphVisualization({ data }: GraphVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeGraphNode | null>(null);
  const [visibleRelationships, setVisibleRelationships] = useState<Record<string, boolean>>({
    "PREREQUISITE_FOR": true,
    "PART_OF": true,
    "APPLIED_IN": true,
    "RELATED_TO": true,
  });

  // Extract all unique relationship types from the data
  const allRelationshipTypes = Array.from(
    new Set(data.links.map(link => link.type))
  );

  // Filter links based on visible relationships
  const getVisibleLinks = () => {
    return data.links.filter(link => 
      link.type && visibleRelationships[link.type]
    );
  };

  // Update the visualization when data or visible relationships change
  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    // Clear any existing visualization
    d3.select(svgRef.current).selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    // Create SVG element
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");
    
    // Add zoom functionality
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    
    svg.call(zoomBehavior);
    
    // Create group for all elements
    const g = svg.append("g");
    
    // Get filtered links
    const visibleLinks = getVisibleLinks() as SimulationLink[];
    
    // Create force simulation with properly typed nodes
    const simulation = d3.forceSimulation<SimulationNode>(data.nodes as SimulationNode[])
      .force("link", d3.forceLink<SimulationNode, SimulationLink>(visibleLinks)
        .id(d => d.id)
        .distance(100)
        .strength(d => d.value ? d.value * 0.01 : 0.01))
      .force("charge", d3.forceManyBody().strength(-150))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));
    
    // Create links
    const linkElements = g.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(visibleLinks)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value || 1))
      .attr("marker-end", "url(#arrow)");
    
    // Add arrowhead marker
    svg.append("defs").selectAll("marker")
      .data(["arrow"])
      .join("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -0.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#999")
      .attr("d", "M0,-5L10,0L0,5");
    
    // Add link labels
    const linkLabels = g.append("g")
      .selectAll("text")
      .data(visibleLinks)
      .join("text")
      .attr("font-size", 8)
      .attr("text-anchor", "middle")
      .attr("dy", -5)
      .text(d => d.label || "");
    
    // Determine node colors based on group
    const color = d3.scaleOrdinal<string>()
      .domain([0, 1, 2, 3, 4, 5].map(String))
      .range(["#aaa", "#4C4CFF", "#FF4C4C", "#4CFF4C", "#FFFF4C", "#4CFFFF"]);
    
    // Create node groups
    const nodeGroups = g.append("g")
      .selectAll("g")
      .data(data.nodes as SimulationNode[])
      .join("g")
      .call(d3.drag<SVGGElement, SimulationNode>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));
    
    // Add node circles
    nodeGroups.append("circle")
      .attr("r", 10)
      .attr("fill", d => color(String(d.group || 0)))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .on("click", (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
      });
    
    // Add node labels
    nodeGroups.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", -15)
      .attr("font-size", 10)
      .text(d => d.name)
      .attr("pointer-events", "none");
    
    // Clear selection when clicking on the background
    svg.on("click", () => setSelectedNode(null));
    
    // Update positions on each tick
    simulation.on("tick", () => {
      linkElements
        .attr("x1", d => (d.source as SimulationNode).x || 0)
        .attr("y1", d => (d.source as SimulationNode).y || 0)
        .attr("x2", d => (d.target as SimulationNode).x || 0)
        .attr("y2", d => (d.target as SimulationNode).y || 0);
      
      linkLabels
        .attr("x", d => (((d.source as SimulationNode).x || 0) + ((d.target as SimulationNode).x || 0)) / 2)
        .attr("y", d => (((d.source as SimulationNode).y || 0) + ((d.target as SimulationNode).y || 0)) / 2);
      
      nodeGroups.attr("transform", d => `translate(${d.x || 0},${d.y || 0})`);
    });
    
    // Function to highlight connected nodes and links
    const highlightConnections = (node: KnowledgeGraphNode | null) => {
      if (!node) {
        // Reset all elements
        nodeGroups.attr("opacity", 1);
        linkElements.attr("opacity", 0.6).attr("stroke", "#999");
        linkLabels.attr("opacity", 1);
        return;
      }
      
      // Find connections
      const connectedNodeIds = new Set<string>();
      connectedNodeIds.add(node.id);
      
      visibleLinks.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        
        if (sourceId === node.id) connectedNodeIds.add(targetId);
        if (targetId === node.id) connectedNodeIds.add(sourceId);
      });
      
      // Highlight nodes and links
      nodeGroups.attr("opacity", d => connectedNodeIds.has(d.id) ? 1 : 0.2);
      
      linkElements
        .attr("opacity", d => {
          const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
          const targetId = typeof d.target === 'object' ? d.target.id : d.target;
          return (sourceId === node.id || targetId === node.id) ? 1 : 0.1;
        })
        .attr("stroke", d => {
          const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
          const targetId = typeof d.target === 'object' ? d.target.id : d.target;
          return (sourceId === node.id || targetId === node.id) ? "#ff9900" : "#999";
        });
      
      linkLabels.attr("opacity", d => {
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        return (sourceId === node.id || targetId === node.id) ? 1 : 0.1;
      });
    };
    
    // Update highlights when selected node changes
    highlightConnections(selectedNode);
    
    // Add resize handling
    const handleResize = () => {
      if (svgRef.current) {
        const newWidth = svgRef.current.clientWidth;
        const newHeight = svgRef.current.clientHeight;
        
        svg.attr("width", newWidth)
           .attr("height", newHeight)
           .attr("viewBox", [0, 0, newWidth, newHeight]);
        
        simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
        simulation.alpha(0.3).restart();
      }
    };
    
    window.addEventListener("resize", handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      simulation.stop();
    };
  }, [data, visibleRelationships, selectedNode]);
  
  // Function to find related concepts for the selected node
  const findRelatedConcepts = (node: KnowledgeGraphNode | null, links: SimulationLink[]) => {
    if (!node) return { prerequisites: [], dependents: [], related: [] };
    
    const prerequisites: KnowledgeGraphNode[] = [];
    const dependents: KnowledgeGraphNode[] = [];
    const related: KnowledgeGraphNode[] = [];
    
    // Process each link
    links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      // If selected node is the target, source is a prerequisite
      if (targetId === node.id) {
        const sourceNode = typeof link.source === 'object' 
          ? link.source 
          : data.nodes.find(n => n.id === sourceId);
        
        if (sourceNode && !prerequisites.some(p => p.id === sourceNode.id)) {
          prerequisites.push(sourceNode);
        }
      }
      // If selected node is the source, target is a dependent
      else if (sourceId === node.id) {
        const targetNode = typeof link.target === 'object' 
          ? link.target 
          : data.nodes.find(n => n.id === targetId);
        
        if (targetNode && !dependents.some(d => d.id === targetNode.id)) {
          dependents.push(targetNode);
        }
      }
      // Otherwise, check if there's an indirect relationship
      else if (link.type === "RELATED_TO") {
        if (sourceId === node.id || targetId === node.id) {
          const relatedNodeId = sourceId === node.id ? targetId : sourceId;
          const relatedNode = data.nodes.find(n => n.id === relatedNodeId);
          
          if (relatedNode && !related.some(r => r.id === relatedNode.id)) {
            related.push(relatedNode);
          }
        }
      }
    });
    
    return { prerequisites, dependents, related };
  }

  // Handle user assessment of a concept
  const handleConceptAssessment = async (nodeId: string, understood: boolean) => {
    console.log(`Recording assessment for node ${nodeId}: ${understood ? "Understood" : "Not Understood"}`);
    
    // In a real implementation, you would:
    // 1. Send the assessment to an API endpoint
    // 2. Store it in the database with user_id, node_id, created_at, assessment, updated_at
    // 3. Use graph algorithms to recommend next content
    
    // For now, just log it
    const assessmentData = {
      user_id: "current-user", // In a real app, this would be the actual user ID
      node_id: nodeId,
      created_at: new Date().toISOString(),
      assessment: understood ? "understood" : "not_understood",
      updated_at: new Date().toISOString()
    };
    
    console.log("Assessment data:", assessmentData);
    
    // If the user doesn't understand the concept, recommend related content
    if (!understood) {
      // Find the node
      const node = data.nodes.find(n => n.id === nodeId);
      if (node) {
        const relatedConcepts = findRelatedConcepts(node, getVisibleLinks() as SimulationLink[]);
        
        // Recommend prerequisites if any exist
        if (relatedConcepts.prerequisites.length > 0) {
          console.log("Recommended content based on prerequisites:");
          relatedConcepts.prerequisites.forEach(concept => {
            console.log(`- ${concept.name}: ${concept.description}`);
          });
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <GraphControls 
        relationshipTypes={allRelationshipTypes}
        visibleRelationships={visibleRelationships}
        setVisibleRelationships={setVisibleRelationships}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3 bg-white dark:bg-gray-900 overflow-hidden h-[800px] relative">
          <svg 
            ref={svgRef} 
            className="w-full h-full"
            style={{ cursor: "grab" }}
          />
        </Card>
        
        <div className="lg:col-span-1">
          <ConceptDetails 
            node={selectedNode} 
            relatedConcepts={findRelatedConcepts(selectedNode, getVisibleLinks() as SimulationLink[])}
            onAssessment={handleConceptAssessment}
          />
        </div>
      </div>
    </div>
  );
} 