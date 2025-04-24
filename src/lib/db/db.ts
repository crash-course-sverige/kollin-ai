
// Config to connect with Neon database

import { drizzle } from "drizzle-orm/neon-http";

export const db = drizzle(process.env.DATABASE_URL!);

// Config to connect with RDS database

// import { Signer } from "@aws-sdk/rds-signer";
// import { awsCredentialsProvider } from "@vercel/functions/oidc";
// import { drizzle } from "drizzle-orm/node-postgres";
// import { Client } from "pg";
//
// type SSLConfig =
// 	| {
// 			ca: string;
// 			rejectUnauthorized?: boolean;
// 	  }
// 	| {
// 			rejectUnauthorized: boolean;
// 	  }
// 	| false;
//
// function getSSLConfig(): SSLConfig {
// 	const cert = process.env.DB_CERT;
// 	if (cert) {
// 		return {
// 			ca: Buffer.from(cert, "base64").toString(),
// 			rejectUnauthorized: true,
// 		};
// 	}
// 	return {
// 		rejectUnauthorized: false,
// 	};
// }
//
// const getPassword = async () => {
// 	if (process.env.NODE_ENV !== "development") {
// 		const signer = new Signer({
// 			credentials: awsCredentialsProvider({
// 				roleArn: process.env.AWS_ROLE_ARN!,
// 			}),
// 			region: "eu-north-1",
// 			port: 5432,
// 			hostname: process.env.DB_HOST!,
// 			username: process.env.DB_USER!,
// 		});
// 		return signer.getAuthToken();
// 	}
// 	return process.env.DB_PASSWORD;
// };
//
// const createClient = async () => {
// 	try {
// 		const password = await getPassword();
// 		const clientConfig = {
// 			host: process.env.DB_HOST,
// 			user: process.env.DB_USER,
// 			password,
// 			database: process.env.DB_NAME,
// 			port: Number.parseInt(process.env.DB_PORT || "5432"),
// 			ssl: getSSLConfig(),
// 			connectionTimeoutMillis: 5000,
// 			statement_timeout: 5000,
// 		};
//
// 		const client = new Client(clientConfig);
// 		await client.connect();
//
// 		client.on("error", (error) => {
// 			console.error("Unexpected error on client", error);
// 		});
//
// 		return client;
// 	} catch (error: unknown) {
// 		console.error("Error in createClient:", error);
// 		throw error;
// 	}
// };
//
// const client = await createClient();
// export const db = drizzle(client);
