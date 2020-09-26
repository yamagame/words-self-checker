import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch, withRouter, } from "react-router-dom";
import WordsClassTool  from './pages/WordsClassTool';
import WordsSelfChecker from './pages/WordsSelfChecker';
import Storage from './Storage';

const ToolPage = withRouter(WordsClassTool);

function App() {
  const [programmingData, setProgrammingData] = React.useState({type: [], word: []});
  const [datascienceData, setDatascienceData] = React.useState({type: [], word: []});
  const [webtechnologyData, setWebtechnologyData] = React.useState({type: [], word: []});

  React.useEffect(() => {
    async function loadData() {
      setProgrammingData(await Storage.loadCheckerData('programming'));
      setDatascienceData(await Storage.loadCheckerData('datascience'));
      setWebtechnologyData(await Storage.loadCheckerData('webtechnology'));
    }
    loadData();
  }, []);
  
  return (
    <Router>
      <Switch>
        {
          (process.env.NODE_ENV !== 'production')?(
            <Route path={["/programming/tool/:wordType", "/programming/tool"]}>
              <ToolPage
                category="programming"
                categoryURL="programming"
              />
            </Route>):null
        }
        {
          (process.env.NODE_ENV !== 'production')?(
            <Route path={["/datascience/tool/:wordType", "/datascience/tool"]}>
                <ToolPage
                  colors={{
                    cardBG: 'bg-green-200',
                    selectBG: 'bg-green-400',
                  }}
                  category="datascience"
                  categoryURL="datascience"
                  subkeyword="データサイエンス"
                />
            </Route>):null
        }
        {
          (process.env.NODE_ENV !== 'production')?(
            <Route path={["/webtech/tool/:wordType", "/webtech/tool"]}>
                <ToolPage
                  colors={{
                    cardBG: 'bg-orange-200',
                    selectBG: 'bg-orange-400',
                  }}
                  category="webtechnology"
                  categoryURL="webtech"
                  subkeyword="Web技術"
                />
            </Route>):null
        }
        <Route path="/datascience">
          <WordsSelfChecker
            title="DATASCIENCE WORDS SELF CHECKER"
            checkerKey="DSSC"
            wordList={datascienceData.word}
            typeList={datascienceData.type}
            colors={{
              cardBG: 'bg-green-200',
              headerBG: 'bg-green-500',
              selectBG: 'bg-green-400',
              checkMark: '#48BB78',
            }}
            subkeyword="データサイエンス"
          />
        </Route>
        <Route path="/webtech">
          <WordsSelfChecker
            title="WEBTECH WORDS SELF CHECKER"
            checkerKey="WTSC"
            wordList={webtechnologyData.word}
            typeList={webtechnologyData.type}
            colors={{
              cardBG: 'bg-orange-200',
              headerBG: 'bg-orange-500',
              selectBG: 'bg-orange-400',
              checkMark: '#ED8936',
            }}
            subkeyword="Web技術"
          />
        </Route>
        <Route path={["/programming", "/"]}>
          <WordsSelfChecker
            title="PROGRAMMING WORDS SELF CHECKER"
            checkerKey="PWSC"
            wordList={programmingData.word}
            typeList={programmingData.type}
            subkeyword="プログラミング"
          />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
