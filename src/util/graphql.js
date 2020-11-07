// import gql from 'graphql-tag'
import { gql } from '@apollo/client'


export const FETCH_POSTS_QUERY = gql`
{
  getPosts {
    id 
    body 
    createdAt 
    username 
    userCreated
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
    user{
      email
      profilePic
      username
      createdAt
    }
  }
}
`
export const COMMENT_SUBSCRIPTION = gql`
  subscription onCommentAdded{
    newComment {
      id
      body
      username
      commentCount
      comments{
        id
        createdAt
        body
        username
      }
      likeCount
      likes{
        id
        username
        createdAt
      }      
    }
  }
`
export const DELETE_COMMENT_SUBSCRIPTION = gql`
  subscription onCommentDeleted{
    onDeleteComment{
      id
      body
      username
      commentCount
      comments{
        id
        createdAt
        body
        username
      }
      likeCount
      likes{
        id
        username
        createdAt
      }      
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
      user {        
        profilePic
        email
        createdAt
      }
    }
  }
`

export const DELETE_POST_SUBSCRIPTION = gql`
  subscription OnPostDeleted{
    deletePostSub{
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

export const LIKE_POST_SUBSCRIPTION = gql`
  subscription OnLike{
    newLike{
      id
      likes {
        id
        username
      }
      likeCount
    }
  }
`