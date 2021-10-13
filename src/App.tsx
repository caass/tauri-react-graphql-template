import React from "react";
import logo from "./logo.svg";
import "./App.css";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";

function App() {
  const HELLO = gql`
    query {
      hello
    }
  `;

  const { loading, error, data } = useQuery(HELLO);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          {loading
            ? "loading"
            : error
            ? JSON.stringify(error)
            : data
            ? JSON.stringify(data)
            : "wtf"}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
