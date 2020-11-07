import React from 'react'

import App from './App'

import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client'
import { setContext } from 'apollo-link-context'
import { createUploadLink } from 'apollo-upload-client'
import { WebSocketLink } from 'apollo-link-ws'
import { split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'


// console.log('currently running on: ', process.env.NODE_ENV, ' server')
const uploadUri = process.env.NODE_ENV === 'development' ? 'http://localhost:5000/graphql/' : 'https://mighty-caverns-32856.herokuapp.com/graphql/'
const uploadLink = createUploadLink({
  uri: uploadUri
})

const wsUri = process.env.NODE_ENV === 'development' ? 'ws://localhost:5000/graphql' : 'wss://mighty-caverns-32856.herokuapp.com/graphql'
const wsLink = new WebSocketLink({
  uri: wsUri,
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
    Query: {
      fields: {
        getPosts:{
          merge: false
        }
      }
    },
    Post: {
      fields: {
        comments: {
          merge: false
        },
        likes: {
          merge: false
        },
        body: {
          merge: false
        },
        url: {
          merge: false
        },
        username: {
          merge: false
        },
        createdAt: {
          merge: false
        },        
        getPosts:{
          merge: false
        },
        user: {
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