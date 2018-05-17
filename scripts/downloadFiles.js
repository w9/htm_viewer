"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
var cheerio_1 = __importDefault(require("cheerio"));
var fs_1 = __importDefault(require("fs"));
var lodash_1 = __importDefault(require("lodash"));
var papaparse_1 = __importDefault(require("papaparse"));
var csvContent = fs_1.default.readFileSync('../public/list.csv').toString();
var table = papaparse_1.default.parse(csvContent, {
    header: true,
});
var patterns = [
    {
        name: 'Miaochan-nexus',
        regex: /the board.{0,50}?recommend.{0,50}?vote.{0,50}?(against|for).{0,50}?.proposal/g,
    },
];
console.log('number of rows =', table.data.length);
var outputTable = lodash_1.default(table.data)
    .filter(function (x) { return x.num_pages_with_shareholder_proposal > 5; })
    .slice(0, 500)
    .map(function (row, i) {
    var fileContent = fs_1.default.readFileSync("../public/o1-htm_files/" + row.Filename + ".htm").toString();
    var text = cheerio_1.default(fileContent)
        .text()
        .replace(/[^\w,.:;]+/g, ' ')
        .toLowerCase();
    var _loop_1 = function (pattern) {
        var matchRes = text.match(pattern.regex);
        if (matchRes) {
            return { value: matchRes.map(function (m) {
                    console.log(chalk_1.default.inverse.bold.green(" [" + i + "] " + pattern.name + " "));
                    var matchDiversity = m.match(/diversity/g);
                    var numDiversity = matchDiversity ? matchDiversity.length : 0;
                    return __assign({}, row, { pattern_type: pattern.name, occurrence_begin: m.slice(0, 100), occurrence_end: m.slice(m.length - 100), diversity: numDiversity });
                }) };
        }
    };
    for (var _i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
        var pattern = patterns_1[_i];
        var state_1 = _loop_1(pattern);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    console.log(chalk_1.default.inverse.bold.red("[" + i + "] Not found"));
    return [row];
})
    .flatten()
    .value();
fs_1.default.writeFileSync('results.csv', papaparse_1.default.unparse(outputTable));
