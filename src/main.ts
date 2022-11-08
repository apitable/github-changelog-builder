// MIT License
// Copyright (c) 2022 Kelly Peilin Chan <kelly@apitable.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// const { Octokit, App } = require("octokit");
import { createCommand } from "commander";
const program = createCommand();

import { Octokit } from "octokit";
const { DateTime } = require("luxon");
const fs = require('fs');
// import { Octokit } from "https://cdn.skypack.dev/octokit?dts";
// import { Command } from "https://deno.land/x/cliffy@v0.25.2/command/mod.ts";
// import { format } from "https://deno.land/std@0.158.0/datetime/mod.ts";

async function requestCompareCommits(octokit: Octokit, owner: string, repo: string, base: string, head: string) {
    const res = await octokit.request(`GET /repos/{owner}/{repo}/compare/{basehead}`, {
        owner: owner,
        repo: repo,
        basehead: base + "..." + head,
    });
    return res.data.commits as ICommit[];
}

interface ICommit {
    author: {
        login: string;
    }
    commit: {
        message: string;
    }
}

function parseCommit(commit: ICommit) {
    const username = commit.author.login;
    const message = commit.commit.message.split(/\r?\n/)[0];
    return {username, message}
}

function getLineFromCommit(commit: ICommit) {
    const {username, message} = parseCommit(commit);

    // if contains "#1234", then → [#1234](https://github.com/xxx/yyy/pull/52071)
    const reg = /\#(?<number>\d+)/
    let result = message.match(reg);
    let mdMessage = message;
    if (result) {
        let groups = result.groups;
        if (groups) {
            let prUrl = `[#${groups.number}](https://github.com/vikadata/vikadata/pull/${groups.number})`
            mdMessage = message.replace(reg, prUrl);
        }
    }

    const mdUsername = `@${username}`

    return `* ${mdMessage} ${mdUsername} \n`;
}

async function main (token: string, owner: string, repo: string, from: string, to: string, appendFile: string) {
    const octokit = new Octokit({ auth: token });
    const {
        data: {},
      } = await octokit.rest.users.getAuthenticated();

    const commits = await requestCompareCommits(octokit, owner, repo, from, to)

    // classify commits by type
    const features: any[] = []
    const fixes: any[] = []
    const more: any[] = []

    for (const commit of commits) {
        const {message} = parseCommit(commit);
        if (message.startsWith("feat")) {
            features.push(commit);
        } else if (message.startsWith("fix")) {
            fixes.push(commit)
        } else {
            more.push(commit);
        }
    }

    let str = "";
    const date = DateTime.format(new Date(), "yyyy-MM-dd");

    str += `## [${to}](https://github.com/vikadata/vikadata/releases/tag/${to}) (${date})\n\n`

    if (features.length > 0) {
        str += "\n### Features and enhancements\n\n"
    }
    for (const commit of features) {
        str += getLineFromCommit(commit);
    }

    if (fixes.length > 0) {
        str += "\n### Bug fixes\n\n"
    }
    for (const commit of fixes) {
        str += getLineFromCommit(commit);
    }
    if (more.length > 0) {
        str += "\n### What's more\n\n"
    }
    for (const commit of more) {
        str += getLineFromCommit(commit);
    }

    console.log(str);

    console.log("\n\n\nAppending to file: ", appendFile);

    const changelog = await fs.readFileSync(appendFile);
    let firstHeadIndex = changelog.indexOf("## ")

    let newChangelog = ""
    if (firstHeadIndex == -1) {
        newChangelog = changelog + "\n\n" + str;
    } else {
        newChangelog = changelog.slice(0, firstHeadIndex) + str + changelog.slice(firstHeadIndex);
    }

    await fs.writeFileSync(appendFile, newChangelog);
};

// await new Command()
//     .name("changelog-generator")
//     .description("Github Changelog Generator")
//     .version("v0.0.1")
//     .option("--token <token:string>", "Github Token")
//     .option("-o, --owner <owner:string>", "Github Repo Owner")
//     .option("-r, --repo <repo:string>", "Github Repo Name")
//     .option("-f, --from <from:string>", "Commit SHA/Tag From")
//     .option("-t, --to <to:string>", "Commit SHA/Tag To")
//     .option("-a, --append-file <appendFile:string>", "Append to file")
//     .action(main)
//     .parse();

program
  .name("changelog-generator")
  .description(`

Github Changelog Builder
============================
Quick build a beautiful github-friendly changelog from commits between two tags or commits with Github API

https://github.com/apitable/github-changelog-builder

  
  `)
  .version("v0.0.1")
  .requiredOption("--token <token:string>", "Github Token")
  .requiredOption("-o, --owner <owner:string>", "Github Repo Owner")
  .requiredOption("-r, --repo <repo:string>", "Github Repo Name")
  .requiredOption("-f, --from <from:string>", "Commit SHA/Tag From")
  .requiredOption("-t, --to <to:string>", "Commit SHA/Tag To")
  .requiredOption("-a, --append-file <appendFile:string>", "Append to file");


if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

program.parse();

const options = program.opts();

main(options.token, options.owner, options.repo, options.from, options.to, options.appendFile);
console.log(options);
