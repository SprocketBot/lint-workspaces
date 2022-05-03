import { exec } from "child_process";
import { readFileSync } from "fs";
import { cwd } from "process";
import { PackageJson } from "./types";
import { sortFiles } from "./util";

// Load and sort files to lint
const files = process.argv.slice(2);
const { workspaces } = JSON.parse(readFileSync(`${cwd()}/package.json`).toString()) as PackageJson
const toLintByWorkspace = sortFiles(files, workspaces);

// Lint each workspace in a promise
const promises: Promise<void>[] = [];

for (const workspace of workspaces) {
    const files = toLintByWorkspace[workspace];
    if (!files.length) continue;

    const p = new Promise<void>((resolve, reject) => {
        exec(`npm run lint --workspace=${workspace} -- --fix -c ${cwd()}/${workspace}/.eslintrc.cjs ${files.join(" ")}`,
            (err, stdout) => {
                if (err) {
                    // If lint fails, log and reject
                    console.log(stdout);
                    reject();
                } else {
                    // If lint successful, stay quiet
                    resolve();
                }
            }
        );
    });

    promises.push(p);
}

// If any promises reject, exit with error
Promise.allSettled(promises).then(results => {
    const failed = results.some(p => p.status === "rejected");
    if (failed) {
        process.exit(1);
    }
})
