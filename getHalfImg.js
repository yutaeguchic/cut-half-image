const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const sharp = require('sharp');
let padding;
let distFolder;
let count;

//実行
init();

async function init() {
  await getData();
}

//yaml取得
async function getData() {
  try {
    const data = await yaml.load(fs.readFileSync('./setting.yml', 'utf8'));
    padding = data.padding;
    getFolder(data);
  } catch (e) {
    console.log(e);
  }
}

//フォルダー取得
async function getFolder(data) {
  const folders = await fs.readdirSync(data.dir.src);
  for(const folderName of folders) {
    const folder = await data.dir.src + folderName + '/';
    distFolder = await data.dir.dist + folderName + '/';
    count = await 1;
    if(!fs.existsSync(distFolder)) {
      await fs.mkdirSync(distFolder);
    }
    await getImg(folder);
  }
}

//画像ファイル取得
async function getImg(folder) {
  const images = await fs.readdirSync(folder);
  for(imageName of images) {
    const image = await folder + imageName;
    await cutImg(image);
  }
}

//画像処理
async function cutImg(image) {
  const ext = await path.extname(image);
  const imageLeft = await sharp(image);
  const imageRight = await sharp(image);
  const metadata = await imageLeft.metadata();
  const width = await metadata.width;
  const height = await metadata.height;
  const imageRightPath = await distFolder + _zeroPadding(count) + ext;
  await count++;
  const imageLeftPath = await distFolder + _zeroPadding(count) + ext;
  await count++;

  //right
  await imageRight.extract({
    width: (width/2) - padding.right,
    height: height,
    left: width/2,
    top: 0
  }).toFile(imageRightPath);
  await console.log('create: ' + imageRightPath);

  //left
  await imageLeft.extract({
    width: (width/2) - padding.left,
    height: height,
    left: padding.left,
    top: 0
  }).toFile(imageLeftPath);
  await console.log('create: ' + imageLeftPath);

  function _zeroPadding(num) {
    return ('000' + num).slice(-3);
  }
}