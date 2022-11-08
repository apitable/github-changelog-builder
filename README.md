# github-changelog-builder 

Quick build a beautiful github-friendly changelog from commits between two tags or commits with Github API


## Usage

```
npx github-changelog-builder \
                        --token ${YOUR_GITHUB_TOKEN:-TOKEN} \
                        --owner ${GITHUB_OWNER:-apitable} \
                        --repo ${GITHUB_REPO:-apitable} \
                        --from ${FROM:-d36e31baa93655db5b6bb38843a7dfe625b08749} \
                        --to ${TO:-HEAD} \
                        --append-file ${CHANGELOG_FILE:-CHANGELOG}
```