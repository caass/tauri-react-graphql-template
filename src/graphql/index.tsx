import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  Operation,
} from "@apollo/client";
import { ApolloLink } from "@apollo/client";
import { invoke } from "@tauri-apps/api/tauri";
import { ExecutionResult, print } from "graphql";
import React from "react";
import { Observable } from "zen-observable-ts";

type RustGraphQlRequest = {
  query: string;
  operationNmae?: string;
  variables: any;
  uploads: any[];
  extensions: any;
};

/**
 * Converts an Operation, the type used by Apollo, into a type our
 * backend understands.
 *
 * @param operation The GraphQL Operation to execute
 * @returns A type that our backend understands
 */
const convertGraphQlRequest = (operation: Operation): RustGraphQlRequest => {
  const query = print(operation.query);

  return {
    ...operation,
    query,
    uploads: [], // ?
  };
};

const createGraphQlQuerySender = (
  tauriHandlerName: string
): ((operation: Operation) => Promise<unknown>) => {
  return (operation: Operation) => {
    // console.log("in js, before converting query");
    // console.log(JSON.stringify(operation));
    const query = convertGraphQlRequest(operation);
    // console.log("in js, after before converting query");
    // console.log(JSON.stringify(query));
    return invoke(tauriHandlerName, { query });
  };
};

const parseAndCheckTauriResponse = (
  operation: Operation
): ((response: unknown) => ExecutionResult) => {
  // const { response: rawResponse } = operation.getContext();
  return (response) => {
    // TODO: whatever apollo does here
    // console.log("received response from rust");
    /* Shockingly, the rust types and ts types line up here.
      /// Query response
      #[derive(Debug, Default, Serialize, Deserialize, PartialEq)]
      pub struct Response {
          /// Data of query result
          #[serde(default)]
          pub data: Value,

          /// Extensions result
          #[serde(skip_serializing_if = "BTreeMap::is_empty", default)]
          pub extensions: BTreeMap<String, Value>,

          /// Cache control value
          #[serde(skip)]
          pub cache_control: CacheControl,

          /// Errors
          #[serde(skip_serializing_if = "Vec::is_empty", default)]
          pub errors: Vec<ServerError>,

          /// HTTP headers
          #[serde(skip)]
          pub http_headers: HeaderMap<String>,
      }
    */
    return response as ExecutionResult;
  };
};

/**
 * Creates a Link that we can use to construct our custom GraphQL client
 *
 * @param tauriHandlerName The name of the rust function that handles graphql queries
 * @returns An ApolloLink for use in creating an ApolloClient
 */
const createTauriLink = (tauriHandlerName: string) => {
  const sendGraphQlQuery = createGraphQlQuerySender(tauriHandlerName);

  return new ApolloLink((operation, _forward) => {
    // i have no idea what i'm doing but i'm doing my best.
    // to plagiarize, that is. my best to plagiarize.
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

export const GraphQlProvider: React.FC<{ tauriHandlerName: string }> = ({
  tauriHandlerName,
  children,
}) => {
  const client = new ApolloClient({
    link: createTauriLink(tauriHandlerName),
    cache: new InMemoryCache(),
  });
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
