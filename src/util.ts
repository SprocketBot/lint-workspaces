import { cwd } from "process";

export const determineWorkspace = (file: string, workspaces: string[]): string | null => {
    const relativePath = file.replace(`${cwd()}/`, "");
    for (const workspace of workspaces) {
        if (relativePath.startsWith(workspace)) return workspace;
    }
    return null
}

export const sortFiles = (files: string[], workspaces: string[]): Record<string, string[]> => {
    // Get unique array of files to lint
    const toLint = [...new Set(files)]

    const initial: Record<string, string[]> = {}
    workspaces.forEach(workspace => initial[workspace] = [])

    const toLintByWorkspace = toLint.reduce<Record<string, string[]>>((acc, v) => {
        const workspace = determineWorkspace(v, workspaces);
        if (workspace) acc[workspace].push(v);
        return acc;
    }, initial);

    return toLintByWorkspace;
}