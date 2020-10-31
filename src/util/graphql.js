// import gql from 'graphql-tag'
import { gql } from '@apollo/client'


export const FETCH_POSTS_QUERY = gql`
{
  getPosts {
    id 
    body 
    createdAt 
    username 
    likeCount
    likes {
      username
    }
    commentCount
    comments {
      id 
      username 
      createdAt 
      body
    }
    url
  }
}
`

export const POST_SUBSCRIPTION = gql`
  subscription OnPostAdded{
    newPost{
      id 
      body 
      createdAt 
      username 
      likeCount
      likes {
        username
      }
      commentCount
      comments {
        id 
        username 
        createdAt 
        body
      }
      url
    }
  }
`