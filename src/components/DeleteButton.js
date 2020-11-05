import React, { useState } from 'react'
import { Button, Icon, Confirm } from 'semantic-ui-react'
import { useMutation, gql } from '@apollo/client'
import { FETCH_POSTS_QUERY } from '../util/graphql'
import MyPopup from '../util/MyPopup'

function DeleteButton({ postId, commentId, callback }) {

  const [confirmOpen, setConfirmOpen] = useState(false)
  
  const mutation = commentId ? DELETE_COMMENT_MUTATION : DELETE_POST_MUTATION

  const [deletePostOrMutation, {error}] = useMutation(mutation, {
    update(proxy) {
      setConfirmOpen(false)
      if (!commentId) {
        const data = proxy.readQuery({
          query: FETCH_POSTS_QUERY
        })
        const newData = {...data}
        newData.getPosts = newData.getPosts.filter(p => p.id !== postId)   

        // Necessary to avoid errors updating the cache for delete post    
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
    onError: (err)=> {
      console.log("post id does not exist")
      callback()
    },
    variables: {
      postId,
      commentId
    }
  })


  return (
    <>
      {error ? <div>Post has been removed!</div> : (
        <div style={{display:'inline'}}>
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
            size="mini"
          />
        </div>        
      )}
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
