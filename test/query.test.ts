import path from "path";
import { query as queryForCoverage } from "../index";
// @ts-ignore
import { query as queryForProduction } from "../dist";

const query =
	process.env.NODE_ENV === "production" ? queryForProduction : queryForCoverage;
const testFile = path.join(__dirname, "costs.zip");

describe("query() tests", () => {
	it("should always pass", () => {
		expect(true).toBe(true);
	});

	it("should return two results (full query)", async () => {
		const results = await query(testFile, {
			quotes: [
				{
					usd: 0.0003,
					unitId: 4,
					termId: 1,
					usageId: 2,
					lengthTagId: 1,
					classTagId: 2,
					optionTagId: 3,
				},
				{
					usd: 1002729,
					unitId: 58,
					termId: 5,
					usageId: 1,
					lengthTagId: 540,
					classTagId: 538,
					optionTagId: 539,
				},
			],
		});
		expect(results).toMatchSnapshot();
	});

	it("should return one result (partial query)", async () => {
		const result = await query(testFile, {
			quotes: [
				{
					usd: 0.1,
					unitId: 11,
					termId: 1,
				},
			],
		});
		expect(result).toMatchSnapshot();
	});

	it("should return two results (partial query - scan)", async () => {
		const result = await query(
			testFile,
			{
				quotes: [
					{
						usd: 0.1,
						unitId: 11,
						termId: 1,
					},
				],
			},
			true,
			{}, // coverage
		);
		expect(result).toMatchSnapshot();
	});

	it("should be able to query by id (line number minus 1)", async () => {
		const result = await query(testFile, {
			serviceTags: [
				{
					id: 360912,
				},
			],
			regions: [
				{
					id: 3,
				},
			],
		});
		expect(result).toMatchSnapshot();
	});
});
