import chalk from 'chalk';
import cheerio from 'cheerio';
import fs from 'fs';
import _ from 'lodash';
import Papa from 'papaparse';

const csvContent = fs.readFileSync('../public/list.csv').toString();

const table: { data: Array<{ Filename: string; num_pages_with_shareholder_proposal: number }> } = Papa.parse(
  csvContent,
  {
    header: true,
  },
);

const patterns = [
  {
    name: 'Miaochan-nexus',
    regex: /the board.{0,50}?recommend.{0,50}?vote.{0,50}?(against|for).{0,50}?.proposal/g,
  },
  // {
  //   name: 'With resolved',
  //   regex: /proposal.{100,400}?resolved.{0,5000}?board.{0,300}?recommend.{0,300}?vote.{0,300}?(against|for).{0,300}?.proposal/g,
  // },
  // {
  //   name: 'Without resolved',
  //   regex: /proposal.{100,5000}?board.{0,300}?recommend.{0,300}?vote.{0,300}?(against|for).{0,300}?.proposal/g,
  // },
];

console.log('number of rows =', table.data.length);

const outputTable = _(table.data)
  .filter((x) => x.num_pages_with_shareholder_proposal > 5)
  .slice(0, 500)
  .map((row, i) => {
    const fileContent = fs.readFileSync(`../public/o1-htm_files/${row.Filename}.htm`).toString();
    const text = cheerio(fileContent)
      .text()
      .replace(/[^\w,.:;]+/g, ' ')
      .toLowerCase();

    for (const pattern of patterns) {
      const matchRes = text.match(pattern.regex);

      if (matchRes) {
        return matchRes.slice(0, 1).map((m) => {
          console.log(chalk.inverse.bold.green(` [${i}] ${pattern.name} `));
          const matchDiversity = m.match(/diversity/g);
          const numDiversity = matchDiversity ? matchDiversity.length : 0;
          return {
            ...row,
            pattern_type: pattern.name,
            occurrence_begin: m.slice(0, 100),
            occurrence_end: m.slice(m.length - 100),
            diversity: numDiversity,
          };
        });
      }
    }

    console.log(chalk.inverse.bold.red(`[${i}] Not found`));
    // return [row];
    return [];
  })
  .flatten()
  .value();

fs.writeFileSync('results.csv', Papa.unparse(outputTable));
