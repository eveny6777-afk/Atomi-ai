{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "src",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "collectCoverageFrom": [
    "**/*.(t|j)s"
  ],
  "coverageDirectory": "../coverage",
  "testEnvironment": "node",
  "roots": [
    "<rootDir>",
    "<rootDir>/../"
  ],
  "moduleNameMapper": {
    "^src/(.*)$": "<rootDir>/src/$1",
    "^@atomic-ai/(.*)$": "<rootDir>/../../packages/$1/src"
  }
}
