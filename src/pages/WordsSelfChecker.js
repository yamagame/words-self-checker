import React from 'react';
import { withRouter, } from "react-router-dom";
import Chart from 'chart.js';

function Container({title, children, onClickDownload}) {
  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between flex-wrap bg-teal-500 p-6">
        <div className="flex items-center flex-shrink-0 text-white mr-6">
          <span className="font-semibold text-xl tracking-tight">{title}</span>
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
}) => {
  const textColor = (category) => {
    return selectedCategory===category?'text-white bg-blue-500 ':'text-gray-500 bg-transparent';
  }
  return (
    <div className={`flex text-sm hover:bg-blue-700 hover:text-white text-white font-bold py-1 px-2 rounded ${textColor(category)}`} onClick={onClick}>
      <div className="flex-1 my-2"> {label}:{ wordList.filter( v => v.type === category || category === 'all' ).length } </div>
    </div>
  )
}

const WordCell = ({item, answer, onClick}) => {
  const textColor = (category) => {
    if (answer === 1) return 'bg-blue-200';
    return 'bg-gray-200';
  }
  return (
    <div className="relative inline-block align-middle">
      <div className={`flex items-center m-2 h-24 ${textColor(item)} rounded-lg shadow`} style={{ width: "6.5rem", }} onClick={onClick}>
        <div className="block w-full text-gray-700">
          <p className="absolute top-0 m-2 text-xs">{item.label}</p>
          <p className="select-none font-bold text-sm text-center">
            <a className="underline"
              target="it-word-book"
              href={"https://www.google.com/search?q="+encodeURI(item.word+' プログラミング')}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >{ item.word }</a>
          </p>
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
}) => {
  return (
    <>
    {
      wordList.filter(v => {
        if (category === 'null') {
            return (typeof(v.type) === 'undefined')
        }
        if (category === 'all') return true;
        if (category === v.type) return true;
        return false;
      }).map( (v, i) => {
        const item = { ...v };
        item.label = categoryLabels[item.type];
        return (
          <WordCell
            key={i}
            item={item}
            answer={answer[v.word]}
            onClick={onSelectHandler(v)}
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

export default withRouter(function({
  history,
  wordList,
  typeList,
  checkerKey,
  title,
  match,
}) {
  const { category } = match.params;
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [answer, setAnswer] = React.useState({});
  const canvasEl = React.useRef(null);
  const chartRef = React.useRef(null);
  const localStorageKey = `self-checker-answer:${checkerKey}`;

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

  React.useEffect(() => {
    updateChart(answer, wordList, typeList);
  }, [answer, wordList, typeList]);

  React.useEffect(() => {
    try {
      const a = JSON.parse(localStorage.getItem(localStorageKey));
      setAnswer(a?a:{});
    } catch(err) {
    }
    setSelectedCategory(category?category:'all');
  }, [category, localStorageKey]);

  const onSelectHandler = (item) => {
    return () => {
      const a = { ...answer };
      if (!a[item.word]) {
        a[item.word] = 1;
      } else {
        a[item.word] = 0;
      }
      localStorage.setItem(localStorageKey, JSON.stringify(a));
      setAnswer(a);
    }
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
    >
      <div className="">
        <canvas
          className="mx-auto my-10"
          ref={canvasEl}
          width="400"
          height="400"
        ></canvas>
      </div>
      <div className="flex block my-2 justify-center">
        <CategorySum
          wordList={wordList}
          label="全て"
          category="all"
          selectedCategory={selectedCategory}
          onClick={onSelectCategoryHander('all')}
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
              />
            )
          })
        }
      </div>
      <p className="text-center font-bold text-gray-700 my-4">知っている単語のカードをクリック</p>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-0 justify-items-center">
        <WordList
          wordList={wordList}
          category={selectedCategory}
          categoryLabels={typeList.reduce((a, c) => {a[c.type] = c.label;return a;}, {})}
          answer={answer}
          onSelectHandler={onSelectHandler}
        />
      </div>
    </Container>
  )
})