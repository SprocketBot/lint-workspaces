import { exec } from "child_process";
import { readFileSync } from "fs";
import { cwd } from "process";
import { PackageJson } from "./types";
import { determineWorkspace } from "./util";

const files = process.argv.slice(2);

const { workspaces } = JSON.parse(readFileSync(`${cwd()}/package.json`).toString()) as PackageJson

// Get unique array of files to lint
const toLint = [...new Set(files)]

const initial: Record<string, string[]> = {}
workspaces.forEach(workspace => initial[workspace] = [])

const toLintByWorkspace = toLint.reduce<Record<string, string[]>>((acc, v) => {
    const workspace = determineWorkspace(workspaces, v);
    if (workspace) acc[workspace].push(v);
    return acc;
}, initial);

const promises: Promise<void>[] = [];

for (const workspace of workspaces) {
    const files = toLintByWorkspace[workspace];
    if (!files.length) continue;

    const p = new Promise<void>((resolve, reject) => {
        exec(`npm run lint --workspace=${workspace} -- --fix -c ${cwd()}/${workspace}/.eslintrc.cjs ${files.join(" ")}`,
            (err, stdout) => {
                if (err) {
                    console.log(stdout);
                    reject();
                } else {
                    resolve();
                }
            }
        );
    });

    promises.push(p);
}

Promise.allSettled(promises).then(results => {
    const failed = results.some(p => p.status === "rejected");
    if (failed) {
        process.exit(1);
    }
})
