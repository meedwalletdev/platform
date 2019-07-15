module.exports = {
  "roots": [
    "<rootDir>/../src"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}"
  ],
  "coverageDirectory": "<rootDir>/../coverage",

}
