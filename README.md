
# Dependency track Github Action

This action uploads a software bill of materials file to a Dependency-Track server and retrieves vulnerability information and outputs to PR if the github action is triggered for a pull request.

## Inputs

### `serverHostBaseUrl`

**Required** Dependency-Track server host base url

### `apikey`

**Required** Dependency-Track API key

### `projectname`

**Required** Project name in Dependency-Track. Example: repository name

### `projectversion`

**Required** Project version in Dependency-Track. Example: the branch name of the PR, or the branch name on which the push event is triggered.

### `autocreate`

Automatically create project and version in Dependency-Track if it doesn't exist, default `false`

### `bomFilePath`

**Required** Path and filename of the BOM, example : `bom.xml` if it is located in root directory

### `timeoutInSecs`

**Required** Timeout in seconds to wait for analysis after uploading bom. Recommended: 10

### `prNumber`

Conditionally **Required** if action is `on: pull_request`. If you do not need to comment on PR, or if its only for `on: push`, this value can be ommitted. Example value is : `${{ github.event.pull_request.number }}` for a pull request.

### `repository`

The full name of the repository containing the issue or pull request. Default value is `${{ github.repository }}`

### `token`

GITHUB_TOKEN or a repo scoped PAT. Default value is `${{ github.token }}`

### `failOnSeverityLevel`

Possible Values are one of CRITICAL, HIGH, MEDIUM, LOW. Example: If `MEDIUM` then all vulnerabilities from MEDIUM and above fail check/task. If omitted, it will not fail check on any vulnerabilities found. PR will still show all vulnerabilities.


## Example usage for on pull request

```yaml
uses: neerajsu/dependency-track-gh-action@v1.0.3
with:
  serverHostBaseUrl: 'https://depedency.server.url.company.com'
  apikey: ${{ secrets.DEPENDENCYTRACK_APIKEY }}
  projectname: 'some-project-repository'
  projectversion: 'feat/some-feature-branch'
  autocreate: 'true'
  bomFilePath: 'target/bom.xml'
  timeoutInSecs: '10'
  prNumber: ${{ github.event.pull_request.number }}
```

## Example usage for on push

```yaml
uses: neerajsu/dependency-track-gh-action@v1.0.3
with:
  serverHostBaseUrl: 'https://depedency.server.url.company.com'
  apikey: ${{ secrets.DEPENDENCYTRACK_APIKEY }}
  projectname: 'some-project-repository'
  projectversion: 'main'
  bomFilePath: 'target/bom.xml'
  timeoutInSecs: '10'
  failOnSeverityLevel: 'CRITICAL'
```
