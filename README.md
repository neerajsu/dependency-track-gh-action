> This action still Work in progress.

# Dependency track Github Action

This action uploads a software bill of materials file to a Dependency-Track server and retrieves vulnerability information and outputs to PR if the github action is triggered for a pull request.

## Inputs

### `serverhostname`

**Required** Dependency-Track server hostname

### `port`

Defaults to 443

### `apikey`

**Required** Dependency-Track API key

### `projectname`

**Required** Project name in Dependency-Track

### `projectversion`

**Required** Project version in Dependency-Track

### `autocreate`

Automatically create project and version in Dependency-Track, default `false`

### `bomfilename`

Path and filename of the BOM, default `bom.xml`

## Example usage

```
uses: neerajsu/dependency-track-gh-action@v1.0.0
with:
  serverhostname: 'https://depedency.server.url.company.com'
  apikey: ${{ secrets.DEPENDENCYTRACK_APIKEY }}
  projectname: 'some-project-repository'
  projectversion: 'master'
```