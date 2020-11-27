import * as vscode from "vscode";
import * as config from "config";
import * as fs from "fs";
import * as path from "path";
import template from "lodash/template";
import yaml from "js-yaml";

import _ from "lodash";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";

export interface TemplateInfo {
    path: string;
    label: string;
    filename: string;
    code: string;
    defaultArguments: { [key: string]: any };
}

const loadTemplateInfo = (path: string): TemplateInfo | undefined => {
    let doc: any;
    try {
        doc = yaml.safeLoad(fs.readFileSync(path, "utf8"));
    } catch (e) {
        console.log(`Tempest: Error loading YAML file: \`${e}\``);
        return;
    }
    if (_.isString(doc) || _.isUndefined(doc)) {
        return;
    }
    return {
        path: path,
        label: doc.name,
        filename: doc.filename,
        code: doc.template,
        defaultArguments: doc.defaultArguments,
    };
};

export const getAllTemplates = (): TemplateInfo[] => {
    const dir = config.getTemplatesDir();
    if (!dir) {
        return [];
    }
    const result = fs
        .readdirSync(dir)
        .map((fileOrDir) => path.join(dir, fileOrDir))
        .filter((p) => {
            const isFile = fs.statSync(p).isFile();
            const extOk =
                path.extname(p) === ".yml" || path.extname(p) === ".yaml";
            return isFile && extOk;
        })
        .map((p) => loadTemplateInfo(p))
        .filter((v) => !_.isUndefined(v));
    return result as any;
};

dayjs.extend(LocalizedFormat);
const templateImports = {
    dayjs,
    _,
};

export const evalFileTemplate = (info: TemplateInfo, args: object): string => {
    const templateCode = info.code;

    const imports = {};

    const t = template(templateCode, { imports: templateImports });
    const isValidValue = _.overSome<any>([
        _.isString,
        _.isArray,
        _.isNumber,
        _.isObject,
    ]);
    let data = _.fromPairs(
        _.filter(_.toPairs(args), (pair) => isValidValue(pair[1]))
    );
    _.defaults(data, info.defaultArguments);

    return t(data);
};
