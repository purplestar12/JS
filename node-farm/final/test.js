// const fs = require('fs');
// let personalData = [
//     {'name':'AAA', 'Age':10},
//     {'name':'BBB', 'Age':20},
//     {'name':'CCC', 'Age':30},
// ]
// let template = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8')

// function replaceTemplate(template, ele){
//     let storeReplacedTemplate = template.replace(/{%PRODUCTNAME%}/g, ele.name);
//     storeReplacedTemplate = storeReplacedTemplate.replace(/{%IMAGE%}/g, ele.Age);
//     //console.log('template:' , storeReplacedTemplate);
//     return storeReplacedTemplate;
// }

// const cardsHtml = personalData.map(ele=>replaceTemplate(template, ele));
// console.log(cardsHtml);
// console.log(typeof(cardsHtml))

// function a(ele){
//     return ele*3;
// }

// l = [1,2,3,4];
// const p = l.map(ele=>a(ele))
// console.log(p);

// let personalData = [
//     {'name':'AAA', 'Age':10},
//     {'name':'BBB', 'Age':20},
//     {'name':'CCC', 'Age':30},
// ]

let l = [1, 2, 3, 4, 4, 5, 6];
console.log(l.join());
console.log(l.join(''));
