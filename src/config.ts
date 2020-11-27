import * as vscode from "vscode";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import _ from "lodash";

export const getSetting = <T>(path: string): T | undefined => {
    const config = vscode.workspace.getConfiguration("tempest");
    return config.get<T>(path);
};

export const getTemplatesDir = (): string | undefined => {
    const setting = getSetting<string>("saveFolder");
    if (_.isUndefined(setting) || setting.length === 0) {
        const homeDir = os.homedir();
        let documentsDir = path.join(homeDir, "Documents");
        if (fs.existsSync(documentsDir)) {
            return path.join(documentsDir, "VsCodeTempest");
        } else {
            return undefined;
        }
    }
    return setting;
};
