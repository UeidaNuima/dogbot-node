import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import fetch from 'node-fetch';
import gql from 'graphql-tag';
import config from './config';

const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          ),
        );
      }
      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
      }
    }),
    new HttpLink({
      uri: config.GraphQLURL,
      credentials: 'same-origin',
      fetch: fetch as any,
    }),
  ]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
});

export default client;

export async function getCard(CardID?: number, Name?: string) {
  return client.query<{
    Card: {
      Name: string;
      CardID: number;
      SellPrice: number;
      Rare: number;
      NickNames: string[];
      ConneName: string;
    };
  }>({
    query: gql`
      query($CardID: Int, $Name: String) {
        Card(CardID: $CardID, Name: $Name) {
          CardID
          Name
          SellPrice
          Rare
          NickNames
          ConneName
        }
      }
    `,
    variables: {
      CardID,
      Name,
    },
  });
}

export async function getCards(ClassID?: number) {
  return client.query<{
    Cards: Array<{
      Name: string;
      CardID: number;
      SellPrice: number;
      Rare: number;
      NickNames: string[];
      ConneName: string;
    }>;
  }>({
    query: gql`
      query($ClassID: Int) {
        Cards(Name: $Name, ClassID: $ClassID) {
          CardID
          Name
          SellPrice
          Rare
          NickNames
          ConneName
        }
      }
    `,
    variables: {
      ClassID,
    },
  });
}

export async function getClass(Name?: string, ClassID?: number) {
  return client.query<{
    Class: {
      ClassID: number;
      Name: string;
      MaxLevel: number;
      JobChange: number;
      JobChangeMaterials: Array<{
        ClassID: number;
        Name: string;
      }>;
      Data_ExtraAwakeOrbs: Array<{
        ClassID: number;
        Name: string;
      }>;
    };
  }>({
    query: gql`
      query($Name: String, $ClassID: Int) {
        Class(Name: $Name, ClassID: $ClassID) {
          MaxLevel
          ClassID
          Name
          JobChange
          JobChangeMaterials {
            ClassID
            Name
          }
          Data_ExtraAwakeOrbs {
            ClassID
            Name
          }
        }
      }
    `,
    variables: {
      Name,
      ClassID,
    },
  });
}

export async function getClassesByMaterial(MaterialID: number) {
  return client.query<{
    Classes: Array<{
      ClassID: number;
      Name: string;
      JobChange: number;
    }>;
  }>({
    query: gql`
      query($MaterialID: Int!) {
        Classes(MaterialID: $MaterialID) {
          ClassID
          Name
          JobChange
        }
      }
    `,
    variables: {
      MaterialID,
    },
  });
}
