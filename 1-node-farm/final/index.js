const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');

const v = 'ppp';

//FILE SYSTEM
// synchronous - blocking code
// const readFileInput = fs.readFileSync('./txt/input-file.txt', 'utf-8');

// const writeFileOutput = `This is a health byte: ${readFileInput} \nThis file is created on ${new Date().getFullYear()}.`
// fs.writeFileSync('./txt/output-text.txt', writeFileOutput)

// console.log('File written successfully! !')

// fs.readFile('./txt/start.txt', 'utf-8', (err, data1)=>{
//     if(err) return console.log('ERROR !!')
//     fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2)=>{
//     console.log(data2);
//         fs.readFile(`./txt/append.txt`, 'utf-8', (err, data3)=>{
//         console.log(data3);
//             fs.writeFile(`./txt/final.txt`, `${data2}\n${data3}`, 'utf-8',err=>{
//                 console.log('your file has been written ');
//             });
//         });

//     });
// });
// console.log('reading file!!')

//CREATING A SERVER

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const slugs = dataObj.map((product) =>
  slugify(product.productName, { lower: true }),
);
console.log(`slugs: ${slugs}, \t ${typeof slugs}`);

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8',
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8',
);
const tempProducts = fs.readFileSync(
  `${__dirname}/templates/template-products.html`,
  'utf-8',
);

const server = http.createServer((req, res) => {
  console.log('url:', req.url);
  const { query, pathname } = url.parse(req.url, true);
  //overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    let cardTemplate = dataObj
      .map((product) => replaceTemplate(product, tempCard))
      .join('');
    //console.log(`cardTemplate: ${cardTemplate}, \n${typeof(cardTemplate)}`);
    const showtempOverview = tempOverview.replace(
      '{%PRODUCT_CARDS%}',
      cardTemplate,
    );
    res.end(showtempOverview);
  }
  //products page
  else if (pathname === '/product') {
    const indexObj = dataObj[query.id];
    const outputProdTmp = replaceTemplate(indexObj, tempProducts);
    res.end(outputProdTmp);
  }
  //api page
  else if (pathname === '/api') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);
  } else {
    res.writeHead(404, {
      'content-type': 'text/html',
      'my-own-header': 'hello-world',
    });
    res.end('<h1>PAGE NOT FOUND !</h1>');
  }
});

server.listen(8000, 'localhost', () => {
  console.log('Listening to the server!!');
});
