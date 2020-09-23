const fs = require('fs');
const path = require('path');

function copy(category) {
  const TypeList = require(path.join(__dirname, 'data', category, 'TypeList.json'));
  const WordList = require(path.join(__dirname, 'data', category, 'WordList.json'));

  const loadWords = () => {
    function katakanaToHiragana(src) {
      return src.replace(/[\u30a1-\u30f6]/g, function (match) {
        var chr = match.charCodeAt(0) - 0x60;
        return String.fromCharCode(chr);
      });
    }

    const double_w = [];

    return fs.readFileSync(path.join(__dirname, 'data', category, 'Words.txt')).toString().split('\n').filter((line, i, self) => {
      const w = line.trim();
      if (self.indexOf(w) !== i) {
        double_w.push(w);
      }
      return w != '' && w.indexOf('#') != 0 && self.indexOf(w) == i;
    }).sort((a, b) => {
      a = katakanaToHiragana(a.toString());
      b = katakanaToHiragana(b.toString());
      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      }
      return 0;
    })
  }

  const Words = loadWords();
  const WordsHash = Words.reduce((a,c) => { a[c] = c; return a;}, {});
  const NewWordList = WordList.filter( w => typeof(WordsHash[w.word]) !== 'undefined' );

  fs.writeFileSync(path.join(__dirname, 'src', 'categories', category, 'TypeList.json'), JSON.stringify(TypeList, null, '  '));
  fs.writeFileSync(path.join(__dirname, 'src', 'categories', category, 'WordList.json'), JSON.stringify(NewWordList, null, '  '));
}

copy('programming');
copy('datascience');
copy('webtechnology');
