import * as vscode from "vscode";
import { Uri } from "vscode";

import * as templates from "templates";
import * as path from "path";
import * as config from "config";

export default () => {
    const templatePaths = templates.getAllTemplates();
    vscode.window.showQuickPick(templatePaths).then((value) => {
        const promise: Promise<
            [Uri | undefined, templates.TemplateInfo]
        > = new Promise((resolve, reject) => {
            if (typeof value === "undefined") {
                reject();
                return;
            }
            vscode.window
                .showSaveDialog({
                    title: "New File from Template (Tempest)...",
                    defaultUri: vscode.workspace.workspaceFolders
                        ? Uri.file(
                              path.join(
                                  vscode.workspace.workspaceFolders[0].uri
                                      .fsPath,
                                  value.filename
                              )
                          )
                        : undefined,
                })
                .then((saveUri) => {
                    resolve([saveUri, value]);
                });
        });

        promise
            .then((data) => {
                const [saveUri] = data;
                if (typeof saveUri === "undefined") {
                    return Promise.reject<[Uri, templates.TemplateInfo]>(
                        "Tempest: Operation canceled!"
                    );
                }
                let edit = new vscode.WorkspaceEdit();
                edit.createFile(saveUri);
                return new Promise<[Uri | undefined, templates.TemplateInfo]>(
                    (resolve, reject) => {
                        vscode.workspace.applyEdit(edit).then((success) => {
                            if (success) {
                                resolve(data);
                            }
                            reject(
                                `ERROR! Tempest failed to create file: '${saveUri}'`
                            );
                        });
                    }
                );
            })
            .then((data) => {
                const [saveUri, templateInfo] = data;
                let edit = new vscode.WorkspaceEdit();
                let templateData = config.getSetting<object>("data");
                const s = templates.evalFileTemplate(
                    templateInfo,
                    templateData || {}
                );
                console.log(s);
                edit.insert(saveUri!, new vscode.Position(0, 0), s);
                return new Promise<Uri>((resolve, reject) => {
                    vscode.workspace.applyEdit(edit).then((success) => {
                        if (success) {
                            resolve(saveUri!);
                        }
                        reject(
                            "ERROR! Tempest failed to insert generated text in new file!"
                        );
                    });
                });
            })
            .then((saveUri) => {
                return new Promise<void>((resolve, reject) => {
                    vscode.window.showTextDocument(saveUri).then((edt) => {
                        edt.document.save().then(() => {
                            resolve();
                        });
                    });
                });
            })
            .catch((reason: string) => {
                vscode.window.showErrorMessage(reason);
            });
    });
};
