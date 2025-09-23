import { v4 as uuidv4 } from 'uuid';
import pool from '../db';
import { ResultSetHeader } from 'mysql2';

async function main() {
	console.log('Seeding database...');

	// Users
	const users = [
		{ name: 'Alice', email: 'alice@example.com', passwordHash: '$2b$10$alicehash' },
		{ name: 'Bob', email: 'bob@example.com', passwordHash: '$2b$10$bobhash' },
		{ name: 'Charlie', email: 'charlie@example.com', passwordHash: '$2b$10$charliehash' }
	];

	const userIds: number[] = [];
	for (const u of users) {
		const [res] = await pool.query<ResultSetHeader>(
			"INSERT INTO users (name, email, passwordHash, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())",
			[u.name, u.email, u.passwordHash]
		);
		userIds.push(res.insertId);
	}

	// Resources
	const resourcesData = [
		{ title: 'Project Plan', description: 'Initial draft', IDusers: userIds[0], IDowner: userIds[0] },
		{ title: 'Design Doc', description: 'v1', IDusers: userIds[1], IDowner: userIds[1] }
	];
	const resourceIds: number[] = [];
	for (const r of resourcesData) {
		const [res] = await pool.query<ResultSetHeader>(
			"INSERT INTO resources (title, description, IDusers, IDowner, updatedAt, createdAt) VALUES (?, ?, ?, ?, NOW(), NOW())",
			[r.title, r.description, r.IDusers, r.IDowner]
		);
		resourceIds.push(res.insertId);
	}

	// File versions and files
	const fv1 = uuidv4();
	const fv2 = uuidv4();
	await pool.query(
		"INSERT INTO file_versions (IDFileVersions, uploadAt, IDfile, versionNumber, filepath) VALUES (?, NOW(), NULL, ?, ?)",
		[fv1, 1, '/files/project-plan-v1.pdf']
	);
	await pool.query(
		"INSERT INTO file_versions (IDFileVersions, uploadAt, IDfile, versionNumber, filepath) VALUES (?, NOW(), NULL, ?, ?)",
		[fv2, 1, '/files/design-doc-v1.pdf']
	);

	const [fileRes1] = await pool.query<ResultSetHeader>(
		"INSERT INTO file (nameFile, typeFile, createdAt, IDusers, IDFileVersions, IDusers_1) VALUES (?, ?, NOW(), ?, ?, ?)",
		['project-plan.pdf', 'application/pdf', userIds[0], fv1, userIds[0]]
	);
	const fileId1 = fileRes1.insertId;
	const [fileRes2] = await pool.query<ResultSetHeader>(
		"INSERT INTO file (nameFile, typeFile, createdAt, IDusers, IDFileVersions, IDusers_1) VALUES (?, ?, NOW(), ?, ?, ?)",
		['design-doc.pdf', 'application/pdf', userIds[1], fv2, userIds[1]]
	);
	const fileId2 = fileRes2.insertId;

	// Backfill IDfile in file_versions (optional linkage)
	await pool.query("UPDATE file_versions SET IDfile = ? WHERE IDFileVersions = ?", [fileId1, fv1]);
	await pool.query("UPDATE file_versions SET IDfile = ? WHERE IDFileVersions = ?", [fileId2, fv2]);

	// Messages
	await pool.query(
		"INSERT INTO message (content, read, createdAt, IDusers) VALUES (?, ?, NOW(), ?)",
		['Bienvenue sur la plateforme', false, userIds[0]]
	);
	await pool.query(
		"INSERT INTO message (content, read, createdAt, IDusers) VALUES (?, ?, NOW(), ?)",
		['Document partagé avec vous', true, userIds[1]]
	);

	// Resource shares
	await pool.query(
		"INSERT INTO resource_share (IDresources_1, IDusers_1, permission, createdAt, IDresources, IDusers) VALUES (?, ?, ?, NOW(), ?, ?)",
		[resourceIds[0], userIds[1], 'read', resourceIds[0], userIds[1]]
	);
	await pool.query(
		"INSERT INTO resource_share (IDresources_1, IDusers_1, permission, createdAt, IDresources, IDusers) VALUES (?, ?, ?, NOW(), ?, ?)",
		[resourceIds[1], userIds[0], 'write', resourceIds[1], userIds[0]]
	);

	console.log('Seeding done.');
}

main()
	.catch((err) => {
		console.error('Seed error:', err);
		process.exitCode = 1;
	})
	.finally(async () => {
		await pool.end();
	});
