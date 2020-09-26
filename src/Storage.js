import axios from 'axios';
import ProgrammingTypeList from './categories/programming/TypeList.json';
import ProgrammingWordList from './categories/programming/WordList.json';
import DataScienceTypeList from './categories/datascience/TypeList.json';
import DataScienceWordList from './categories/datascience/WordList.json';
import WebTechTypeList from './categories/webtechnology/TypeList.json';
import WebTechWordList from './categories/webtechnology/WordList.json';

const data = {
  programming: {
    type: ProgrammingTypeList,
    word: ProgrammingWordList,
  },
  datascience: {
    type: DataScienceTypeList,
    word: DataScienceWordList,
  },
  webtechnology: {
    type: WebTechTypeList,
    word: WebTechWordList,
  },
}

export default {
  loadType: async (category) => {
    return (await axios.post(`/typeData/${category}`)).data
  },
  loadWord: async (category) => {
    return (await axios.post(`/wordData/${category}`)).data
  },
  saveWordType: async (category, word, type) => {
    await axios.post(`/wordType/${category}/${encodeURIComponent(word)}/${type}`).then();
  },
  loadCheckerData: async (category) => {
    return data[category];
  },
}
