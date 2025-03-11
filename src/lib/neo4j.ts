import neo4j, { Driver, ServerInfo } from 'neo4j-driver';

let driver: Driver | null = null;

export function getNeo4jDriver(): Driver {
  if (!driver) {
    const uri = process.env.NEO4J_URI || 'neo4j+s://77376a67.databases.neo4j.io';
    const username = process.env.NEO4J_USERNAME || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || '';

    // For neo4j+s:// URLs, the encryption is already set in the URL
    // Don't specify encrypted option in the config
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
      maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
      maxConnectionPoolSize: 50,
      connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
    });
  }
  return driver;
}

export async function closeNeo4jDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

// Helper for running Neo4j queries
export async function runNeo4jQuery(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<Record<string, unknown>[]> {
  const driver = getNeo4jDriver();
  const session = driver.session();
  
  try {
    const result = await session.run(cypher, params);
    
    // Convert Neo4j records to plain objects
    return result.records.map(record => {
      // Use the Neo4j built-in toObject method
      return record.toObject() as Record<string, unknown>;
    });
  } finally {
    await session.close();
  }
}

// Test connection to Neo4j
export async function testNeo4jConnection(): Promise<{ 
  success: boolean; 
  message: string; 
  serverInfo?: ServerInfo;
}> {
  try {
    const driver = getNeo4jDriver();
    const serverInfo = await driver.getServerInfo();
    console.log('Neo4j connection successful:', serverInfo);
    return {
      success: true, 
      message: 'Connection to Neo4j established successfully', 
      serverInfo
    };
  } catch (err) {
    console.error('Neo4j connection error:', err);
    return {
      success: false,
      message: err instanceof Error 
        ? `Connection error: ${err.message}` 
        : 'Unknown connection error'
    };
  }
} 