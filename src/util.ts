import { cwd } from "process";

export const determineWorkspace = (workspaces: string[], file: string): string | null => {
    const relativePath = file.replace(`${cwd()}/`, "");
    for (const workspace of workspaces) {
        if (relativePath.startsWith(workspace)) return workspace;
    }
    return null
}
