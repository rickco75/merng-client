import React from 'react'

import App from './App'

import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client'
// import { createHttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context'
import { createUploadLink} from 'apollo-upload-client'
// import { ApolloLink } from '@apollo/client/core'
import { WebSocketLink } from 'apollo-link-ws'
import { split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'

// const httpLink = createHttpLink({
//   // uri: 'https://mighty-caverns-32856.herokuapp.com/graphql'
//   uri: 'http://localhost:5000/graphql/'
// })

const uploadLink = createUploadLink({
  uri: 'https://mighty-caverns-32856.herokuapp.com/graphql/'
  // uri: 'http://localhost:5000/graphql/',
})

const wsLink = new WebSocketLink({
  // uri: 'ws://localhost:5000/graphql',
  uri: 'ws://mighty-caverns-32856.herokuapp.com/graphql',
  options: {
    reconnect: true
  }
})


const authLink = setContext(()=>{
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

const client = new ApolloClient({
  cache: new InMemoryCache(),
  // link: ApolloLink.from([ authLink, uploadLink ])
  link
})

export default (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
)