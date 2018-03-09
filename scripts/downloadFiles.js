const cheerio = require('cheerio');
const Papa = require('papaparse');
const fs = require('fs');

const csvContent = fs.readFileSync('../public/list.csv').toString();

const table = Papa.parse(csvContent, { header: true });

table.data.slice(0, 1).map(row => {
  const fileContent = fs.readFileSync(`../public/o1-htm_files/edgar/data/${row.Filename}.htm`);
  console.log(fileContent);
});
