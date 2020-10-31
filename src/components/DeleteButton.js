import React, { useState } from 'react'
import { Button, Icon, Confirm } from 'semantic-ui-react'
import { useMutation, gql } from '@apollo/client'
//import gql from 'graphql-tag'
import { FETCH_POSTS_QUERY } from '../util/graphql'
import MyPopup from '../util/MyPopup'

function DeleteButton({ postId, commentId, callback }) {
  const [confirmOpen, setConfirmOpen] = useState(false)


  const mutation = commentId ? DELETE_COMMENT_MUTATION : DELETE_POST_MUTATION
  const [deletePostOrMutation] = useMutation(mutation, {
    update(proxy) {
      setConfirmOpen(false)
      if (!commentId) {
        const data = proxy.readQuery({
          query: FETCH_POSTS_QUERY
        })
        const newData = {...data}
        newData.getPosts = newData.getPosts.filter(p => p.id !== postId)   

        // Necessary to avoid errors updating the cache     
        proxy.evict({          
          fieldName: "getPosts",
          broadcast: false
        })
        proxy.writeQuery({ 
            query: FETCH_POSTS_QUERY, data: {
              getPosts: [...newData.getPosts]
            } 
        })
      }

      if (callback) callback()
    },
    variables: {
      postId,
      commentId
    }
  })
  return (
    <>
      <MyPopup
        content={commentId ? "Delete Comment!" : "Delete Post!"}>
        <Button floated="right" as="div" color="red" onClick={() => setConfirmOpen(true)}>
          <Icon name="trash" style={{ margin: 0 }} />
        </Button>
      </MyPopup>

      <Confirm
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={deletePostOrMutation}
      />
    </>
  )
}


const DELETE_POST_MUTATION = gql`
  mutation deletePost($postId: ID!){
    deletePost(postId: $postId)
  }
`
const DELETE_COMMENT_MUTATION = gql`
  mutation deleteComment($postId:ID!,$commentId:ID!){
    deleteComment(postId: $postId, commentId: $commentId){
      id
      comments{
        id
        username
        createdAt
        body
      }
      commentCount
    }
  }
`

export default DeleteButton
