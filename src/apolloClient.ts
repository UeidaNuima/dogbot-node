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

export async function getCard(CardID: number) {
  return client.query<{
    card: {
      Name: string;
      CardID: number;
      SellPrice: number;
      Rare: number;
      NickName: string[];
      ConneName: string;
    };
  }>({
    query: gql`
      query($CardID: Int!) {
        card(CardID: $CardID) {
          CardID
          Name
          SellPrice
          Rare
          NickName
          ConneName
        }
      }
    `,
    variables: {
      CardID,
    },
  });
}

export async function getCards(args: { name?: string; classID?: number }) {
  return client.query<{
    cards: Array<{
      Name: string;
      CardID: number;
      SellPrice: number;
      Rare: number;
      NickName: string[];
      ConneName: string;
    }>;
  }>({
    query: gql`
      query($Name: String, $ClassID: Int) {
        cards(Name: $Name, InitClassID: $ClassID) {
          CardID
          Name
          SellPrice
          Rare
          NickName
          ConneName
        }
      }
    `,
    variables: {
      Name: args.name,
      ClassID: args.classID,
    },
  });
}

export async function getClass(Name?: string, ClassID?: number) {
  return client.query<{
    class: {
      ClassID: number;
      Name: string;
      MaxLevel: number;
      JobChange: number;
      JobChangeMaterial: Array<{
        ClassID: number;
        Name: string;
      }>;
      Data_ExtraAwakeOrb: Array<{
        ClassID: number;
        Name: string;
      }>;
    };
  }>({
    query: gql`
      query($Name: String, $ClassID: Int) {
        class(Name: $Name, ClassID: $ClassID) {
          MaxLevel
          ClassID
          Name
          JobChange
          JobChangeMaterial {
            ClassID
            Name
          }
          Data_ExtraAwakeOrb {
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
    classes: Array<{
      ClassID: number;
      Name: string;
      JobChange: number;
    }>;
  }>({
    query: gql`
      query($MaterialID: Int!) {
        classes(MaterialID: $MaterialID) {
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
