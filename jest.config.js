const collectCoverage = process.env.NODE_ENV !== "production";
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	roots: ["<rootDir>/test"],
	preset: "ts-jest",
	testEnvironment: "node",
	ci: true,
	bail: true,
	maxWorkers: 1,
	maxConcurrency: 1,
	testMatch: ["**/*.test.ts"],
	testTimeout: 10000,
	verbose: true,
	transform: {
		"^.+\\.tsx?$": [
			"ts-jest",
			{
				isolatedModules: true,
			},
		],
	},
	detectLeaks: true,
	errorOnDeprecated: true,
	collectCoverage,
	coveragePathIgnorePatterns: ["/test/", "/dist/"],
	coverageReporters: ["text-summary", "html-spa"],
};
