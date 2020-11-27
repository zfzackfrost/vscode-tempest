import * as vscode from "vscode";
import { Uri } from "vscode";

import * as templates from "templates";
import * as path from "path";
import * as config from "config";

import _ from "lodash";
import { open } from "fs";

export default () => {
    const templateInfos = templates.getAllTemplates();
    const templateDir = config.getTemplatesDir();
    if (_.isUndefined(templateDir)) {
        return;
    }
    vscode.window.showQuickPick(templateInfos).then(async (info) => {
        try {
            const templateInfo = await new Promise<templates.TemplateInfo>(
                (resolve, reject) => {
                    if (_.isUndefined(info)) {
                        reject();
                    } else {
                        resolve(info);
                    }
                }
            );
            return new Promise<void>((resolve, reject) => {
                vscode.window
                    .showTextDocument(Uri.file(templateInfo.path))
                    .then(() => resolve);
            });
        } catch (err) {
            if (_.isString(err) && err.length > 0) {
                vscode.window.showErrorMessage(err);
            }
        }
    });
};
