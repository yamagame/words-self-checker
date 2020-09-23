import React from 'react';
import axios from 'axios';

const WordCell = ({item}) => {
  const textColor = (category) => {
    return 'bg-gray-200';
  }
  return (
    <div className="relative inline-block align-middle">
      <div className={`flex items-center m-2 h-24 ${textColor(item)} rounded-lg shadow`} style={{ width: "6.5rem", }}>
        <div className="block w-full text-gray-700">
          <p className="select-none absolute top-0 m-2 text-xs">{item.label}</p>
          <p className="select-none font-bold text-sm text-center">
            <a className="underline"
              target="words-self-checker"
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

const TypeCell = ({item, selectedType, onClick}) => {
  const textColor = () => {
    if (selectedType === item.type) return 'bg-blue-200';
    return 'bg-gray-200';
  }
  return (
    <div className="relative inline-block align-middle">
      <div className={`flex items-center m-2 h-16 ${textColor()} rounded-lg shadow`} style={{ width: "3.5rem", }} onClick={onClick}>
        <div className="block w-full text-gray-700">
          <p className="select-none font-bold text-sm text-center">
            { item.label }
          </p>
        </div>
      </div>
    </div>
  )
}

const CategorySum = ({
  wordList,
  label,
  category,
  onClick,
  selectedType,
}) => {
  const textColor = (category) => {
    return selectedType===category?'text-white bg-blue-500 ':'text-gray-500 bg-transparent';
  }
  return (
    <div className={`select-none flex text-sm hover:bg-blue-700 hover:text-white text-white font-bold py-1 px-2 rounded ${textColor(category)}`} onClick={onClick}>
      <div className="flex-1 my-2"> {label}:{ wordList.filter( v => (typeof(v.type) === 'undefined' && category === 'null') ||  v.type === category || category === 'all' ).length } </div>
    </div>
  )
}

const TypeList = ({wordList, typeList, selectedType, onSelectType}) => {
  return (
    <div className="hidden md:flex justify-center my-2">
      <CategorySum
        wordList={wordList}
        label="全て"
        category="all"
        selectedType={selectedType}
        onClick={() => onSelectType({ target: { value: 'all' }})}
      />
      <CategorySum
        wordList={wordList}
        label="なし"
        category="null"
        selectedType={selectedType}
        onClick={() => onSelectType({ target: { value: 'null' }})}
      />
      {
        typeList.map( item => {
          return (
            <CategorySum
              key={item.type}
              wordList={wordList}
              label={item.label}
              category={item.type}
              selectedType={selectedType}
              onClick={() => onSelectType({ target: { value: item.type }})}
            />
          )
        })
      }
    </div>
  )
}

export default function({
  history,
  match,
}) {
  const { wordType } = match.params;
  const [selectedType, setSelectedType] = React.useState('all');
  const [wordData, setWordData] = React.useState([]);
  const [typeData, setTypeData] = React.useState([]);

  React.useEffect(() => {
    setSelectedType(wordType?wordType:'all');
  }, [wordType]);

  const loadTypeData = async () => {
    const list = await axios.post('/typeData');
    setTypeData(list.data);
  }
  const loadWordData = async () => {
    const list = await axios.post('/wordData');
    setWordData(list.data);
  }
  const setWordType = async (word, type) => {
      const w = [ ...wordData ];
      w.some( w => {
      if (w.word === word) {
        w.type = type;
        return true;
      }
      return false;
    })
    setWordData(w);
    axios.post(`/wordType/${encodeURIComponent(word)}/${type}`).then();
  }

  React.useEffect(() => {
    loadTypeData();
    loadWordData();
  }, []);

  const onSelectType = (e) => {
    history.push(`/tool/${e.target.value}`);
    setSelectedType(e.target.value);
  }

  const onClickTypeCellHandler = (word, type) => {
    return (e) => {
      setWordType(word, type);
      e.preventDefault();
    }
  }

  return (
    <>
      <TypeList
        wordList={wordData}
        typeList={typeData}
        selectedType={selectedType}
        onSelectType={onSelectType}
      />
      {
        wordData.filter(w => {
          if (selectedType === 'null') {
            return (typeof(w.type) === 'undefined')
          }
          if (selectedType === 'all') return true;
          if (selectedType === w.type) return true;
          return false;
        }).map( (w, i) => {
          return (
            <div key={w.word} className="block border-4">
              <WordCell item={w}/>
              {
                typeData.map( (v, i) => (
                  <TypeCell
                    key={v.label}
                    item={v}
                    selectedType={w.type}
                    onClick={onClickTypeCellHandler(w.word, v.type)}
                  />
                ))
              }
            </div>
          )
        })
      }
    </>
  )
}
