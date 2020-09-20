import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch, Link, } from "react-router-dom";
import TypeList from './TypeList';
import WordList from './WordList';
import WordsSelfChecker from './pages/WordsSelfChecker';

function App() {
  return (
    <Router>
      <Switch>
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
