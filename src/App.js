import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch, withRouter, } from "react-router-dom";
import TypeList from './TypeList.json';
import WordList from './WordList.json';
import WordsClassTool  from './pages/WordsClassTool';
import WordsSelfChecker from './pages/WordsSelfChecker';

const ToolPage = withRouter(WordsClassTool);

function App() {
  return (
    <Router>
      <Switch>
        {
          (process.env.NODE_ENV !== 'production')?(
            <Route path={["/tool/:wordType", "/tool"]}>
              <ToolPage />
            </Route>):null
        }
        <Route path="/">
          <WordsSelfChecker
            title="PROGRAMMING WORDS SELF CHECKER"
            checkerKey="PWSC"
            wordList={WordList}
            typeList={TypeList}
          />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
