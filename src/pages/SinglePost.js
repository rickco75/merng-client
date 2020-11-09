import React, { useContext, useState, useRef, useEffect, useCallback } from 'react'

import { useQuery, useMutation, useSubscription, gql } from '@apollo/client'
import { Button, Card, Grid, Image, Icon, Form, Modal } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

import moment from 'moment'
import LikeButton from '../components/LikeButton'
import { AuthContext } from '../context/auth'
import DeleteButton from '../components/DeleteButton'
import MyPopup from '../util/MyPopup'
import { COMMENT_SUBSCRIPTION, DELETE_COMMENT_SUBSCRIPTION, POST_SUBSCRIPTION } from '../util/graphql'

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
      user {
        profilePic
        createdAt
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
  const [openImage, setOpenImage] = useState(false)

  const { subscribeToMore, loading, data } = useQuery(FETCH_POST_QUERY, {
    variables: {
      postId
    },
    onError: err => {
      console.log(err)
      props.history.push('/')
    },
  })

  useSubscription(COMMENT_SUBSCRIPTION)
  useSubscription(DELETE_COMMENT_SUBSCRIPTION)
  useSubscription(POST_SUBSCRIPTION)

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

  useEffect(() => {
    subscribeToNewComments()
  }, [subscribeToNewComments])

  const [submitComment, { error }] = useMutation(SUBMIT_COMMENT_MUTATION, {
    update() {
      setComment('')
      commentInputRef.current.blur()
    },
    variables: {
      postId,
      body: comment
    },
    onError: (err) => {
      console.log("error submitting comment post does not exist! ", err)
    }
  })


  let postMarkup

  if (loading) {
    postMarkup = <p>Loading post...</p>
  }
  else if (!data || error) {
    postMarkup = <div>
      This post has been removed!
        <hr />
      <Button as={Link} to="/">Return to posts</Button></div>
  }
  else {
    const { id, body, createdAt, username, comments, likes, likeCount, commentCount, url, user: { profilePic, createdAt: userCreatedAt } } = data.getPost

    const uc = userCreatedAt ? moment(userCreatedAt).format("MMM yyyy") : 'not available'
    const avatarPopupMessage = `${username} has been a member since ${uc}`

    const profilePicSrc = profilePic ? profilePic : 'https://react.semantic-ui.com/images/avatar/large/molly.png'

    function deletePostCallback() {
      props.history.push('/')
    }

    postMarkup = (
      <Grid centered container>
        <Grid.Row centered>
          <Grid.Column width={16}>
            <Card fluid>
              <Card.Content>
                <Card.Header>
                  <MyPopup
                    content="Go Back To Posts" >
                    <Button
                      style={{marginBottom:20}}
                      as="div"
                      labelPosition="right">
                      <Button basic color="blue" as={Link} to="/">
                        <Icon name="arrow left" />
                      </Button>
                    </Button>
                  </MyPopup>
                  <MyPopup
                    content={avatarPopupMessage}>
                    <Image
                      avatar
                      floated='right'
                      size='mini'
                      src={profilePicSrc}
                    />
                  </MyPopup>
                </Card.Header>
                <Card.Header>
                  {username}
                </Card.Header>
                <Card.Meta>{moment(createdAt).fromNow()}</Card.Meta>
                <Card.Meta>{commentCount} comment(s)</Card.Meta>
                <Card.Description>{body}</Card.Description>
                {url && (
                  <Card.Description>
                    <Modal
                      onClose={() => setOpenImage(false)}
                      onOpen={() => setOpenImage(true)}
                      open={openImage}
                      trigger={<img style={{ cursor: 'pointer', maxWidth: '60%' }}
                        src={url} title="Click to View!" alt="Click to view!" />}
                    >
                      <Modal.Content image>
                        <Image size='huge' src={url} wrapped />
                      </Modal.Content>
                      <Modal.Actions>
                        <Button onClick={() => setOpenImage(false)} positive>
                          Ok
                        </Button>
                      </Modal.Actions>
                    </Modal>
                  </Card.Description>
                )
                }
              </Card.Content>
              <hr />
              <Card.Content extra>

                <LikeButton user={user} post={{ id, likeCount, likes }} />

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
            {error && <div>post has been removed</div>}
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
