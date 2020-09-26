import axios from 'axios';

export default {
  loadTypeData: async (category) => {
    return await axios.post(`/typeData/${category}`)
  },
  loadWordData: async (category) => {
    return await axios.post(`/wordData/${category}`)
  },
  saveWordType: async (category, word, type) => {
    await axios.post(`/wordType/${category}/${encodeURIComponent(word)}/${type}`).then();
  },
}
