import React from 'react'

import App from './App'

import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client'
import { setContext } from 'apollo-link-context'
import { createUploadLink } from 'apollo-upload-client'
import { WebSocketLink } from 'apollo-link-ws'
import { split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'

const uploadLink = createUploadLink({
  uri: 'https://mighty-caverns-32856.herokuapp.com/graphql/'
  // uri: 'http://localhost:5000/graphql/',
})

const wsLink = new WebSocketLink({
  // uri: 'ws://localhost:5000/graphql',
  uri: 'wss://mighty-caverns-32856.herokuapp.com/graphql',
  options: {
    reconnect: true
  }
})


const authLink = setContext(() => {
  const token = localStorage.getItem("jwtToken")
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  }
})

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  authLink.concat(uploadLink)
)

const cacheOptions = {
  typePolicies: {
    Post: {
      fields: {
        comments: {
          merge: false
        },
        likes: {
          merge: false
        },
        getPosts:{
          merge: false
        }
      }
    }
  }
}

const client = new ApolloClient({
  cache: new InMemoryCache(cacheOptions),
  link
})

export default (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
)