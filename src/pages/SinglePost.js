import React, { useContext, useState, useRef, useEffect, useCallback } from 'react'

import { useQuery, useMutation, useSubscription, gql } from '@apollo/client'
import { Button, Card, Grid, Image, Label, Icon, Form } from 'semantic-ui-react'

import moment from 'moment'
import LikeButton from '../components/LikeButton'
import { AuthContext } from '../context/auth'
import DeleteButton from '../components/DeleteButton'
import MyPopup from '../util/MyPopup'
import { COMMENT_SUBSCRIPTION, DELETE_COMMENT_SUBSCRIPTION } from '../util/graphql'

const FETCH_POST_QUERY = gql`
  query($postId:ID!){
    getPost(postId: $postId){
      id
      body
      createdAt
      username
      likeCount
      likes{
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

function SinglePost(props) {

  const { user } = useContext(AuthContext)
  const commentInputRef = useRef(null)

  const postId = props.match.params.postId

  const [comment, setComment] = useState('')

  useSubscription(COMMENT_SUBSCRIPTION)
  useSubscription(DELETE_COMMENT_SUBSCRIPTION)
  // useSubscription(DELETE_POST_SUBSCRIPTION)

  const { subscribeToMore, loading, data } = useQuery(FETCH_POST_QUERY, {
    variables: {
      postId
    },
    onError: err => {
      console.log(err)
    }
  })

  // const subscribeToDeletedPosts = useCallback(() => {
  //   subscribeToMore({
  //     document: DELETE_POST_SUBSCRIPTION,
  //     updateQuery: (prev, {subscriptionData}) => {
  //       if (!subscriptionData.data) return prev
  //       const newFeedItem = subscriptionData.data.deletePostSub
  //       const newPosts = [...prev.getPosts].filter(post => post.id !== newFeedItem.id)
  //       return Object.assign( {}, prev, {
  //         getPosts: [...newPosts, ...prev.getPosts]
  //       })
  //     }
  //   })    
  // },[subscribeToMore])

  const subscribeToNewComments = useCallback(() => {
    subscribeToMore({
      document: COMMENT_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        const newFeedItem = subscriptionData.data.newComment
        return Object.assign({}, prev, {
          getPost: newFeedItem
        })
      },      
    })
  }, [subscribeToMore])

  useEffect(()=>{
    subscribeToNewComments()
    // subscribeToDeletedPosts()
  }, [subscribeToNewComments])

  const [submitComment] = useMutation(SUBMIT_COMMENT_MUTATION, {
    update() {
      setComment('')
      commentInputRef.current.blur()
    },
    variables: {
      postId,
      body: comment
    }
  })

  let postMarkup

  if (loading) {
    postMarkup = <p>Loading post...</p>
  } else if (!data) {
    postMarkup = <p>There was an error loading your post!</p>
  } else {
    const { id, body, createdAt, username, comments, likes, likeCount, commentCount, url } = data.getPost

    function deletePostCallback() {
      props.history.push('/')
    }

    const openImageNewWindow = url => {
      window.open(url, "_blank")
    }

    postMarkup = (
      <Grid>
        <Grid.Row>
          <Grid.Column width={2}>
            <Image
              src='https://react.semantic-ui.com/images/avatar/large/molly.png'
              size="small"
              float="right"
            />
          </Grid.Column>
          <Grid.Column width={10}>
            <Card fluid>
              <Card.Content>
                <Card.Header>{username}</Card.Header>
                <Card.Meta>{moment(createdAt).fromNow()}</Card.Meta>
                <Card.Description>{body}</Card.Description>
                {url &&
                  <Card.Description>
                    <MyPopup
                      content="Click to view original image!">
                      <Image onClick={() => openImageNewWindow(url)}
                        src={url}
                        size="big" />
                    </MyPopup>
                  </Card.Description>
                }
              </Card.Content>
              <hr />
              <Card.Content extra>
                <LikeButton user={user} post={{ id, likeCount, likes }} />
                <MyPopup
                  content="Total Comments" >
                  <Button
                    as="div"
                    labelPosition="right">
                    <Button basic color="blue">
                      <Icon name="comments" />
                    </Button>
                    <Label basic color="blue" pointing="left">
                      {commentCount}
                    </Label>
                  </Button>
                </MyPopup>

                {user && user.username === username && <DeleteButton callback={deletePostCallback} postId={id} />}
              </Card.Content>
            </Card>
            {user && (
              <Card fluid>
                <Card.Content>
                  <p>Post a comment</p>
                  <Form>
                    <div className="ui action input fluid">
                      <input
                        type="text"
                        placeholder="Comment..."
                        name="comment"
                        value={comment}
                        onChange={event => setComment(event.target.value)}
                        ref={commentInputRef}
                      />
                      <button type="submit"
                        className="ui button teal"
                        disabled={comment.trim() === ''}
                        onClick={submitComment} >
                        Submit
                        </button>
                    </div>
                  </Form>
                </Card.Content>
              </Card>
            )}
            {comments.map(comment => (
              <Card fluid key={comment.id}>
                <Card.Content>
                  {user && user.username === comment.username && (
                    <DeleteButton postId={id} commentId={comment.id} />
                  )}
                  <Card.Header>{comment.username}</Card.Header>
                  <Card.Meta>{moment(comment.createdAt).fromNow()}</Card.Meta>
                  <Card.Description>{comment.body}</Card.Description>
                </Card.Content>
              </Card>
            ))}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  return (
    <>
      {postMarkup}
    </>
  )

}

const SUBMIT_COMMENT_MUTATION = gql`
  mutation createComment($postId: ID!, $body: String!){
    createComment(postId: $postId, body: $body){
      id
      comments{
        id
        body
        createdAt
        username
      }
      commentCount
    }
  }
`


export default SinglePost
