import React from 'react';
import Chart from 'chart.js';

function CheckMark({colors}) {
  return (
    <svg width="24px" height="26px" viewBox="-0.5 -0.5 44 51">
      <path d="M 0.18 34.19 C 0.63 32.5 1.77 31.08 3.31 30.3 C 4.85 29.52 6.64 29.44 8.24 30.09 C 10.57 31.24 12.37 33.26 13.27 35.72 C 17.43 23.7 23.75 12.58 31.91 2.92 C 34.22 0.78 37.46 0 40.47 0.87 C 41.23 0.99 41.89 1.51 42.19 2.24 C 42.5 2.96 42.42 3.8 41.98 4.45 C 30.89 17.2 22.64 32.24 17.81 48.54 C 14.96 50 11.59 50 8.74 48.54 C 6.59 43.67 3.7 39.17 0.18 35.21 C 0 34.89 0 34.5 0.18 34.19 Z"
        fill={colors.checkMark}
        stroke={colors.checkMark}
        strokeMiterlimit="10"
        pointerEvents="all"
      />
    </svg>
  )
}

function Container({
  title,
  children,
  onClickDownload,
  colors,
}) {
  return (
    <div className="container mx-auto">
      <div className={`flex items-center justify-between flex-wrap bg-${colors.header} p-3`}>
        <div className={`flex items-center flex-shrink-0 text-white`}>
          <span className="font-semibold md:text-xl tracking-tight break-words">{title}</span>
        </div>
        <div className="w-full block flex-grow md:flex md:items-center md:w-auto">
          <div className="text-sm md:flex-grow"></div>
          <div>
            <div
               className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 md:mt-0"
               onClick={onClickDownload}
            >Download Result</div>
          </div>
        </div>
      </div>
      <div className="inset-0">
        { children }
      </div>
    </div>
  )
}

const CategorySum = ({
  wordList,
  label,
  category,
  onClick,
  selectedCategory,
  colors,
}) => {
  const textColor = (category) => {
    return selectedCategory===category?`text-white bg-${colors.select}`:'text-gray-500 bg-transparent';
  }
  return (
    <div className={`select-none flex text-sm hover:bg-${colors.select} hover:text-white text-white font-bold py-1 px-2 rounded ${textColor(category)}`} onClick={onClick}>
      <div className="flex-1 my-2"> {label}:{ wordList.filter( v => v.type === category || category === 'all' ).length } </div>
    </div>
  )
}

const WordCard = ({
  item,
  answer,
  onClick,
  colors,
  subkeyword,
  selected,
}) => {
  const textColor = () => {
    if (answer === 1) return `bg-${colors.card}`;
    return 'bg-gray-200';
  }
  const selectColor = () => {
    if (selected) return `border-${colors.select}`;
    if (answer === 1) return `border-${colors.card}`;
    return 'border-gray-200';
  }
  return (
    <div className="relative inline-block align-middle">
      <div className={`${selectColor()} border-4 flex items-center m-2 h-24 ${textColor()} rounded-lg shadow`} style={{ width: "6.5rem", }} onClick={onClick}>
        <div className="block w-full text-gray-700">
          <p className="select-none absolute top-0 m-2 text-xs">{item.label}</p>
          <p className="select-none font-bold text-sm text-center">
            <a className="underline"
              target="words-self-checker"
              href={item.url?item.url:"https://www.google.com/search?q="+encodeURI(item.word+` ${subkeyword}`)}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >{ item.word }</a>
          </p>
          {
            (answer === 1)?(<p className="select-none absolute bottom-0 right-0 m-4">
              <CheckMark colors={colors} />
            </p>):null
          }
        </div>
      </div>
    </div>
  )
}

const WordList = ({
  wordList,
  answer,
  category,
  categoryLabels,
  onSelectHandler,
  colors,
  subkeyword,
  selectedCard,
}) => {
  return (
    <>
    {
      wordList.map( (v, i) => {
        const item = { ...v };
        item.label = categoryLabels[item.type];
        return (
          <WordCard
            key={v.word}
            item={item}
            answer={answer[v.word]}
            onClick={onSelectHandler(v)}
            colors={colors}
            subkeyword={subkeyword}
            selected={selectedCard==v.word}
          />
        )
      })
    }
    </>
  )
}

const calcResult = (w, answer, typeList) => {
  const y = Object.keys(answer).filter( a => answer[a] === 1 );
  const sum = (category) => {
    return w.filter( v => v.type === category ).length
  }
  const cat = {};
  w.forEach( v => { cat[v.word] = v.type } );
  const labels = typeList.map( v => v.label );
  const keys = typeList.map( v => v.type );
  const total = keys.map( key => sum(key) );
  const result = {};
  keys.forEach( key => {
    result[key] = 0;
  })
  y.forEach( w => {
    if (!result[cat[w]]) result[cat[w]] = 0;
    result[cat[w]] ++;
  });
  return {
    labels,
    data: keys.map( (key, i) => parseInt(result[key] * 100 / total[i]) ),
  }
}

export default function({
  wordList,
  typeList,
  checkerKey,
  title,
  colors= {
    card: 'blue-200',
    header: 'blue-500',
    select: 'blue-500',
    checkMark: '#4299E1',
  },
  subkeyword="プログラミング",
}) {
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectedCard, setSelectedCard] = React.useState(null);
  const [filteredWordList, setFilteredWordList] = React.useState([]);
  const [answer, setAnswer] = React.useState({});
  const canvasEl = React.useRef(null);
  const chartRef = React.useRef(null);
  const localStorageKey = `self-checker-answer:${checkerKey}`;
  const renderTimeout = React.useRef(null);

  const updateChart = (answer, wordList, typeList) => {
    const ctx = canvasEl.current.getContext('2d');

    const resultData = calcResult(wordList, answer, typeList);

    if (chartRef.current) {
      chartRef.current.destroy();
    }
    chartRef.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: resultData.labels,
        datasets: [{
          data: resultData.data,
          borderWidth: 4,
          backgroundColor: '#33A2E940',
          borderColor: '#33A2E9',
          pointBorderWidth: 2,
          pointHoverBorderWidth: 2,
          pointBorderColor: 'white',
          pointRadius: 4,
          borderJoinStyle: 'round',
          // label: 'hello',
        }]
      },
      options: {
        responsive: false,
        legend: {
          display: false,
        },
        scale: {
          angleLines: {
            display: false,
          },
          ticks: {
            min: 0,
            max: 100,
            suggestedMin: 0,
            suggestedMax: 50,
            fontSize: 18,
          },
          gridLines: {
            lineWidth: 2,
            circular: false,
          },
          pointLabels: {
            fontSize: 15,
          },
        },
        hover: {
          axis: 'index'
        },
        tooltips: {
          callbacks: {
            title: function(tooltipItem, data) {
              return resultData.labels[tooltipItem[0].index];
            },
          },
        },
      }
    });
  }

  const checkWord = (word) => {
    const a = { ...answer };
    if (!a[word]) {
      a[word] = 1;
    } else {
      a[word] = 0;
    }
    localStorage.setItem(localStorageKey, JSON.stringify(a));
    setAnswer(a);
  }

  React.useEffect(() => {
    setFilteredWordList(wordList.filter(v => {
      if (selectedCategory === 'null') {
          return (typeof(v.type) === 'undefined')
      }
      if (selectedCategory === 'all') return true;
      if (selectedCategory === v.type) return true;
      return false;
    }));
  }, [wordList, selectedCategory]);

  React.useEffect(() => {
    if (renderTimeout.current) {
      clearTimeout(renderTimeout.current);
    }
    renderTimeout.current = setTimeout(() => {
      updateChart(answer, wordList, typeList);
      renderTimeout.current = null;
    }, 1000);
  }, [answer, wordList, typeList]);

  React.useEffect(() => {
    try {
      const a = JSON.parse(localStorage.getItem(localStorageKey));
      setAnswer(a?a:{});
    } catch(err) {
    }
  }, []);

  React.useEffect(() => {
    const listnerKeydown = (e) => {
      const findWord = (word, d) => {
        if (filteredWordList.length == 0) return null;
        let index = filteredWordList.findIndex( w => w.word === word);
        index += d;
        if (index < 0) index = filteredWordList.length-1;
        if (index >= filteredWordList.length) index = 0;
        return filteredWordList[index].word;
        
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        setSelectedCard(findWord(selectedCard,  1));
      }
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setSelectedCard(findWord(selectedCard, -1));
      }
      if (e.code === 'Space') {
        e.preventDefault();
        checkWord(selectedCard);
        setSelectedCard(findWord(selectedCard,  1));
      }
    }
    window.addEventListener('keydown', listnerKeydown)
    return () => {
      window.removeEventListener('keydown', listnerKeydown);
    }
  }, [filteredWordList, selectedCard, answer]);

  const onSelectHandler = (item) => {
    return (e) => {
      setSelectedCard(item.word);
      checkWord(item.word);
    }
  }

  const onSelectCategory = (e) => {
    setSelectedCategory(e.target.value);
    e.preventDefault();
  }

  const onSelectCategoryHander = (category) => {
    return () => {
      setSelectedCategory(category);
    }
  }

  const nowTime = () => {
    const n = new Date();
    return `${(''+n.getFullYear()).slice(-2)}${('0'+(n.getMonth()+1)).slice(-2)}${('0'+n.getDate()).slice(-2)}`;
  }

  const downloadResultJSON = (result) => {
    const blob = new Blob([JSON.stringify(result, null, '  ')], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  const onClickDownload = () => {
    const r = {};
    r.filename = `${checkerKey}-Result-${nowTime()}.json`;
    r.date = new Date();
    r.title = title;
    r.category = typeList;
    const result = JSON.parse(localStorage.getItem(localStorageKey));
    const resultHash = Object.keys(result).reduce((a,c) => { a[c] = result[c]; return a }, {});
    r.result = calcResult(wordList, result, typeList);
    r.words = wordList.map( v => {
      if (resultHash[v.word] !== 1) return { ...v, point: 0, };
      return { ...v, point: 1, };
    });
    downloadResultJSON(r);
  }

  return (
    <Container
      title={title}
      onClickDownload={onClickDownload}
      colors={colors}
    >
      <div className="m-screen my-2">
        <canvas
          className="mx-auto"
          ref={canvasEl}
          width="320"
          height="320"
        ></canvas>
      </div>
      <div className="hidden md:flex justify-center my-2">
        <CategorySum
          wordList={wordList}
          label="全て"
          category="all"
          selectedCategory={selectedCategory}
          onClick={onSelectCategoryHander('all')}
          colors={colors}
        />
        {
          typeList.map( item => {
            return (
              <CategorySum
                key={item.type}
                wordList={wordList}
                label={item.label}
                category={item.type}
                selectedCategory={selectedCategory}
                onClick={onSelectCategoryHander(item.type)}
                colors={colors}
              />
            )
          })
        }
      </div>
      <div className="flex justify-center md:hidden">
        <div className="inline-block relative w-64">
          <select className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline font-bold text-gray-700"
                  value={selectedCategory} onChange={onSelectCategory}
          >
            <option value="all">全て:{ wordList.length }</option>
            {
              typeList.map( (item, i) => {
                return (
                  <option key={i} value={item.type}>{item.label}:{ wordList.filter( v => v.type === item.type ).length }</option>
                )
              })
            }
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>
      <p className="select-none text-center font-bold text-gray-700 mt-4">知っている単語のカードをクリックしてチェック！</p>
      <div className="block text-center text-gray-700 font-bold">({ wordList.reduce( (a,v) => (answer[v.word] === 1 ? a+1: a) , 0) } Point) </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-10 gap-0 justify-items-center">
        <WordList
          wordList={filteredWordList}
          category={selectedCategory}
          categoryLabels={typeList.reduce((a, c) => {a[c.type] = c.label;return a;}, {})}
          answer={answer}
          onSelectHandler={onSelectHandler}
          colors={colors}
          subkeyword={subkeyword}
          selectedCard={selectedCard}
        />
      </div>
    </Container>
  )
}
