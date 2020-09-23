const express = require('express')
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const app = express()
const port = 8001

const TypeDataPath = path.join(__dirname, 'data', 'TypeList.json');
const WordDataPath = path.join(__dirname, 'data', 'WordList.json');
const WordPath = path.join(__dirname, 'data', 'Words.txt');

const loadWords = () => {
  function katakanaToHiragana(src) {
    return src.replace(/[\u30a1-\u30f6]/g, function (match) {
      var chr = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(chr);
    });
  }

  const double_w = [];

  const wordData = JSON.parse(fs.readFileSync(WordDataPath).toString());

  const wordList = fs.readFileSync(WordPath).toString().split('\n').filter((line, i, self) => {
    const w = line.trim();
    if (self.indexOf(w) !== i) {
      double_w.push(w);
    }
    return w != '' && w.indexOf('#') != 0 && self.indexOf(w) == i;
  });

  const newWordHash = wordList.reduce((a,c) => { a[c] = c; return a; }, {});
  
  wordData.forEach( w => (newWordHash[w.word])?(delete newWordHash[w.word]):null );
  Object.keys(newWordHash).forEach( word => wordData.push( { word } ) );

  const newWord = wordData.sort((a, b) => {
    a = katakanaToHiragana(a.word.toString());
    b = katakanaToHiragana(b.word.toString());
    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    }
    return 0;
  })

  return newWord;
}

app.post('/typeData', (req, res) => {
  const typeData = JSON.parse(fs.readFileSync(TypeDataPath).toString());
  res.json(typeData);
})

app.post('/wordData', (req, res) => {
  const wordData = loadWords();
  res.json(wordData);
})

app.post('/wordType/:word/:type', (req, res) => {
  const wordData = loadWords();
  wordData.some( w => {
    if (w.word === req.params.word) {
      w.type = req.params.type;
      return true;
    }
    return false;
  });
  fs.writeFileSync(WordDataPath, JSON.stringify(wordData, null, '  '));
  res.sendStatus(200);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
