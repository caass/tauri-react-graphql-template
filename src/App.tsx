import React from "react";
import logo from "./logo.svg";
import "./App.css";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import { Hello } from "./graphql-types/Hello";

const App: React.FC = () => {
  const helloQuery = gql`
    query Hello {
      hello(name: "Javascript")
    }
  `;

  const { loading, error, data } = useQuery<Hello>(helloQuery);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>{loading ? "loading" : error ? error : data ? data.hello : "wtf"}</p>
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
};

export default App;
