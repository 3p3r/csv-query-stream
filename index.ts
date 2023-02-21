import { ok } from "assert";
import { parse as csvStream, ParseLocalConfig } from "papaparse";
import { async as ZipStream, StreamZipOptions } from "node-stream-zip";

/** Extra parameters for the underlying CSV/TSV parser and ZIP reader. */
export interface ExtraOptions {
	/**
	 * Extra parameters for papaparse.
	 * @see https://www.papaparse.com/docs#config
	 */
	readonly csv?: ParseLocalConfig<unknown, NodeJS.ReadableStream>;
	/**
	 * Extra parameters for node-stream-zip.
	 * @see https://www.npmjs.com/package/node-stream-zip#options
	 */
	readonly zip?: StreamZipOptions;
}

/**
 * Queries a CSV/TSV table in a ZIP file for data using streams.
 * @param file Path to the ZIP file.
 * @param query Query object.
 * @param scan Whether to scan the entire table or stop after the first match.
 * @param opts Extra options for the underlying CSV/TSV parser and ZIP reader.
 * @returns Promise that resolves to an array of matches.
 *
 * @note The Zip file must contain CSV/TSV files at its root and data must have
 * a header row at the beginning of the file. Rows are assumed to be unique and
 * therefore the ID of each row is its line number minus 1.
 *
 * @example
 * usd,unitId,termId
 * 3,1,1
 * 4,1,2
 *
 * And that would be saved in a file called quotes.csv in the root of the ZIP.
 */
export async function query(
	file: string,
	query: Query,
	scan?: boolean,
	opts?: ExtraOptions,
): Promise<Query.Match[]> {
	const zip = new ZipStream({ file, ...opts?.zip });
	const tables = Object.keys(query);
	const results: Query.Match[] = [];
	for (const table of tables) {
		const queries = query[table];
		const stream = await zip
			.stream(`${table}.csv`)
			.catch(() => zip.stream(`${table}.tsv`));
		let id = 1;
		const matches: Query.Match[] = [];
		await new Promise((resolve, reject) => {
			csvStream(stream, {
				header: true,
				dynamicTyping: true,
				...opts?.csv,
				complete: () => resolve(undefined),
				step: function (results, parser) {
					ok(results.errors.length === 0);
					const row = results.data as Query.Field;
					const m = { id, ...row } as Query.Match;
					for (const query of queries) {
						let match = true;
						for (const [column, value] of Object.entries(query)) {
							if (m[column] !== value) {
								match = false;
								break;
							}
						}
						if (match) {
							matches.push(m);
							if (!scan) {
								queries.splice(queries.indexOf(query), 1);
							}
						}
					}
					if (queries.length === 0) {
						parser.abort();
						resolve(undefined);
						return;
					}
					id++;
				},
			});
		});
		results.push(...matches);
	}
	return results;
}

/**
 * Query object.
 * This is a map of table names to an array of query objects.
 * Each query object is a map of column names to values.
 * @example
 * {
 *  "quotes": [
 * 	{
 * 		"usd": 3,
 * 		"unitId": 1,
 * 		"termId": 1,
 * 	},
 * 	{
 * 		"id": 25,
 * 		"unitId": 1,
 * 	},
 * ],
 */
export interface Query {
	/** Table name to data row subset mapping. */
	readonly [table: string]: Array<Query.Field>;
}

export namespace Query {
	export type Field = { readonly [column: string]: unknown };
	export type Match = { id: number } & Field;
}
