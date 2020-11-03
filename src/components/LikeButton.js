import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, gql } from '@apollo/client'
import { Icon, Label, Button } from 'semantic-ui-react'
import MyPopup from '../util/MyPopup'

function LikeButton({ user, post: { id, likeCount, likes } }) {

  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (user && likes.find(like => like.username === user.username)) {
      setLiked(true)
    }
    else setLiked(false)

  }, [user, likes])

  const [likePost, { error }] = useMutation(LIKE_POST_MUTATION, {
    variables: { postId: id },

    onError(err) {
      console.log(err)
    }
  })

  const likeButton = user ? (
    liked ? (
      <Button color='teal'>
        <Icon name='heart' />
      </Button>
    ) : (
        <Button color='teal' basic>
          <Icon name='heart' />
        </Button>
      )
  ) : (
      <Button as={Link} to="/login" color='teal' basic>
        <Icon name='heart' />
      </Button>
    )
  return (
    <>
      {error ? <div>This post has been removed!
        <hr/>
        <Button as={Link} to="/">Return to posts</Button></div> :
        <MyPopup
          content={liked ? 'Unlike' : 'Like'}>
          <Button as='div' labelPosition='right' onClick={likePost}>
            {likeButton}
            <Label color='teal' basic pointing='left'>
              {likeCount}
            </Label>
          </Button>
        </MyPopup>
      }
    </>
  )

}

const LIKE_POST_MUTATION = gql`
  mutation likePost($postId: ID!){
    likePost(postId:$postId){
      id
      likes {
        id
        username
      }
      likeCount
    }
  }
`
export default LikeButton