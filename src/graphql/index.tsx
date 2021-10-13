import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  Operation,
  NormalizedCacheObject,
} from "@apollo/client";
import { ApolloLink } from "@apollo/client";
import { invoke } from "@tauri-apps/api/tauri";
import { ExecutionResult } from "graphql";
import React from "react";
import { Observable } from "zen-observable-ts";

const createGraphQlQuerySender = (
  tauriHandlerName: string
): ((operation: Operation) => Promise<unknown>) => {
  return (operation: Operation) => {
    console.log("in js, before sending query");
    console.log(JSON.stringify(operation));
    return invoke(tauriHandlerName, { operation });
  };
};

const parseAndCheckTauriResponse = (
  operation: Operation
): ((response: unknown) => ExecutionResult) => {
  const { response: rawResponse } = operation.getContext();
  console.log("in js, after receiving response");
  console.log(JSON.stringify(rawResponse));
  return (response) => {
    console.log("attempting to parse response");
    let result = response as ExecutionResult;
    console.log("parsed response");
    console.log(JSON.stringify(result));
    return result;
  };
};

const createTauriLink = (tauriHandlerName: string) => {
  const sendGraphQlQuery = createGraphQlQuerySender(tauriHandlerName);

  return new ApolloLink((operation, _forward) => {
    // i have no idea what i'm doing
    // https://github.com/apollographql/apollo-client/blob/main/src/link/http/createHttpLink.ts#L145
    return new Observable((observer) => {
      sendGraphQlQuery(operation)
        .then((response) => {
          operation.setContext({ response });
          return response;
        })
        .then(parseAndCheckTauriResponse(operation))
        .then((result) => {
          observer.next(result);
          observer.complete();
          return result;
        })
        .catch((err) => observer.error(err));
    });
  });
};

const createTauriClient = (
  tauriHandlerName: string
): ApolloClient<NormalizedCacheObject> => {
  const tauriLink = createTauriLink(tauriHandlerName);
  return new ApolloClient({
    link: tauriLink,
    cache: new InMemoryCache(),
  });
};

export const GraphQlProvider: React.FC<{ tauriHandlerName: string }> = ({
  tauriHandlerName,
  children,
}) => {
  const client = createTauriClient(tauriHandlerName);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
