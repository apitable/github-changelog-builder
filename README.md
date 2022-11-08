
![apphook](https://socialify.git.ci/apitable/github-changelog-builder/image?description=1&font=Inter&language=1&name=1&pattern=Diagonal%20Stripes&stargazers=1&theme=Dark)

# github-changelog-builder 

[![npm](https://img.shields.io/npm/v/github-changelog-builder)](https://www.npmjs.com/package/github-changelog-builder)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/apitable/github-changelog-builder/npm-publish)](https://github.com/apitable/github-changelog-builder/actions)
[![npm bundle size](https://img.shields.io/bundlephobia/min/github-changelog-builder)](https://www.npmjs.com/package/github-changelog-builder)
[![npm](https://img.shields.io/npm/dm/github-changelog-builder)](https://www.npmjs.com/package/github-changelog-builder)


Quick build a beautiful github-friendly changelog from commits between two tags or commits with Github API


## Usage

```
npx github-changelog-builder \
                        --token ${YOUR_GITHUB_TOKEN:-TOKEN} \
                        --owner ${GITHUB_OWNER:-apitable} \
                        --repo ${GITHUB_REPO:-apitable} \
                        --from ${FROM:-d36e31baa93655db5b6bb38843a7dfe625b08749} \
                        --to ${TO:-HEAD} \
                        --append-file ${CHANGELOG_FILE:-CHANGELOG.md}
```