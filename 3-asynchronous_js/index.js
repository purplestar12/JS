const fs = require('fs');
const superAgent = require('superagent');

const readFilePro = (fileName) => {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};

const writeFilePro = (fileName, writeData) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, writeData, (err) => {
      if (err) {
        reject(err);
      }
      resolve(`Written successfully in ${fileName}`);
    });
  });
};

//ASYNC AWAIT
const getAndStoreImage = async () => {
  try {
    const data = await readFilePro('./dog.txt');
    console.log(`breed name:  ${data}`);

    const imgPro1 = superAgent.get(
      `https://dog.ceo/api/breed/${data}/images/random`,
    );
    const imgPro2 = superAgent.get(
      `https://dog.ceo/api/breed/${data}/images/random`,
    );
    const imgPro3 = superAgent.get(
      `https://dog.ceo/api/breed/${data}/images/random`,
    );

    const allImgPro = await Promise.all([imgPro1, imgPro2, imgPro3]);
    const allImgMsg = allImgPro.map((ele) => ele.body.message);

    console.log(allImgMsg);
    await writeFilePro(`${__dirname}/dog-img.txt`, allImgMsg.join('\n'));
    console.log('Written in the file 🐶🐶');
  } catch (err) {
    // console.log('catchhhh');
    throw err.message; //->equiv to return Promise.reject(err); promise was rejected here, it should b handled with catch()
  }
  console.log('Async run successfully  !!');
};

(async () => {
  try {
    console.log('Calling Async');
    await getAndStoreImage();
    console.log('Image was retrieved and stored successfully 👍👍');
  } catch (err) {
    console.log('err : ', err);
  }
})();

//3.CREATING & CONSUMING PROMISES
// readFilePro('./dog.txt')
//   .then((data) => {
//     console.log(`Breed: ${data}`);
//     return superAgent.get(`https://dog.ceo/api/breed/${data}/images/random`);
//   })
//   .then((res) => {
//     console.log('res: ', res.body.message);
//     return writeFilePro(`${__dirname}/dog-img.txts`, res.body.message);
//     // return writeFilePro(`${__dirname}/dog-img.txts`, res.body.message);
//   })
//   .then((result) => console.log(result))
//   .catch((err) => console.log(err.message));

//1.CALL-BACK HELL
// fs.readFile("./dog.txt", (err, data) => {
//   console.log(`Breed: ${data}`);
//   superAgent
//     .get(`https://dog.ceo/api/breed/${data}/images/random`)
//     .end((err, res) => {
//       if (err) {
//         return console.log("err ", err.message);
//       }
//       console.log("res: ", res.body.message);
//       fs.writeFile(`${__dirname}/dog-img.txt`, res.body.message, (err) => {
//         console.log("Dog image file was created !");
//       });
//     });
// });

//2.CONSUMING PROMISES
// fs.readFile("./dog.txt", (err, data) => {
//   console.log(`Breed: ${data}`);
//   superAgent
//     .get(`https://dog.ceo/api/breed/${data}/images/random`)
//     .then((res) => {
//       console.log("res: ", res.body.message);
//       fs.writeFile(`${__dirname}/dog-img.txt`, res.body.message, (err) => {
//         console.log("Dog image file was created !");
//       });
//     })
//     .catch((err) => {
//       console.log("err ", err.message);
//     });
// });
