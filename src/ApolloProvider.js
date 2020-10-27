import React from 'react'

import App from './App'

import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client'
import { createHttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context'
import { createUploadLink} from 'apollo-upload-client'
import { ApolloLink } from '@apollo/client/core'

const httpLink = createHttpLink({
  // uri: 'https://mighty-caverns-32856.herokuapp.com/graphql'
  uri: 'http://localhost:5000/graphql/'
})

const uploadLink = createUploadLink({
  uri: 'http://localhost:5000/graphql/',
})

const authLink = setContext(()=>{
  const token = localStorage.getItem("jwtToken")
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  }
})

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([ authLink, uploadLink ])
})

export default (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
)