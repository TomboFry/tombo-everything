import { v4 as uuid } from 'uuid';
import { getStatement } from './database.js';
import { calculateGetParameters } from './constants.js';

export function insertFood (name, type, created_at, device_id) {
	const statement = getStatement(
		'insertFood',
		`INSERT INTO food
		(id, name, type, created_at, device_id)
		VALUES
		($id, $name, $type, $created_at, $device_id)`,
	);

	return statement.run({
		id: uuid(),
		name,
		type,
		created_at: new Date(created_at).toISOString(),
		device_id,
	});
}

/**
 * @export
 * @param {object} parameters
 * @param {string} [parameters.id]
 * @param {number} [parameters.page]
 * @param {number} [parameters.limit]
 * @param {number} [parameters.days]
 */
export function getFood (parameters) {
	const statement = getStatement(
		'getFood',
		`SELECT * FROM food
		WHERE id LIKE $id AND created_at >= $created_at
		ORDER BY created_at DESC
		LIMIT $limit OFFSET $offset`,
	);

	return statement.all(calculateGetParameters(parameters));
}

export function countFood () {
	const statement = getStatement(
		'countFood',
		'SELECT COUNT(*) as total FROM food',
	);

	return statement.get().total;
}

export function deleteFood (id) {
	const statement = getStatement(
		'deleteFood',
		'DELETE FROM food WHERE id = $id',
	);

	return statement.run({ id });
}

export function updateFood (id, name, type, created_at) {
	const statement = getStatement(
		'updateFood',
		`UPDATE food
		SET name = $name,
		    type = $type,
		    created_at = $created_at
		WHERE id = $id`,
	);

	return statement.run({
		id,
		name,
		type,
		created_at,
	});
}
