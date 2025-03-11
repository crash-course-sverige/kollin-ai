# Courses Feature with Knowledge Graph

This document explains the Courses feature implementation with the interactive Knowledge Graph visualization.

## Overview

The Courses feature adds a new section to the application where users can:

- Browse available courses
- View course details
- Explore relationships between course concepts using an interactive knowledge graph

## Technical Implementation

### Routes Structure

1. `/courses` - Main courses listing page
2. `/courses/[courseId]` - Individual course page
3. `/courses/[courseId]/knowledge-graph` - Knowledge graph visualization for a course

### Components

1. **CoursesSidebar**: Navigation for courses section

   - Shows all available courses
   - Collapsible course list
   - Highlights current route

2. **CourseCard**: Card component for displaying course previews

   - Shows title, description, and difficulty level
   - Links to course details and knowledge graph

3. **KnowledgeGraph**: Interactive visualization component
   - Uses D3.js for graph rendering
   - Interactive nodes and relationships
   - Concept detail viewing on node click
   - Zoom and pan functionality

### Data Model

1. **Course**

   - Basic information (title, description, etc.)
   - List of concepts
   - Difficulty level

2. **Concept**

   - Name, description
   - Relationships to other concepts

3. **Knowledge Graph**
   - Nodes (concepts)
   - Links (relationships between concepts)
   - Visualization metadata (groups, weights, etc.)

### Integration

The courses feature integrates with:

1. Main navigation through the dashboard sidebar
2. Authentication system for access control
3. Neo4j database for graph data (mock data for now)

## Database Integration

### PostgreSQL

- Course metadata and user progress tracking

### Neo4j

- Graph database for concept relationships
- Queries for retrieving knowledge graph data

## Next Steps

1. **Data Layer Integration**:

   - Connect to actual Neo4j database
   - Set up data migrations and schema

2. **User Interactions**:

   - Course enrollment functionality
   - Progress tracking
   - Completed courses dashboard

3. **Knowledge Graph Enhancements**:
   - More detailed concept relationships
   - Interactive guided tours
   - Path recommendation based on learning goals
