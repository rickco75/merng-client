import React, { useContext, useEffect, useCallback } from 'react'
import { useQuery, useSubscription } from '@apollo/client'

import { Grid, Transition } from 'semantic-ui-react'
import { AuthContext } from '../context/auth'
import PostCard from '../components/PostCard'
import PostForm from '../components/PostForm'
import { FETCH_POSTS_QUERY, POST_SUBSCRIPTION, DELETE_POST_SUBSCRIPTION } from '../util/graphql'

function Home(props) {

  const { subscribeToMore, loading, data, refetch, error } = useQuery(FETCH_POSTS_QUERY);

  useSubscription(POST_SUBSCRIPTION)
  useSubscription(DELETE_POST_SUBSCRIPTION)

  const { user } = useContext(AuthContext)

  function deletePostCallback() {
    props.history.push('/')
  }

  const subscribeToNewPosts = useCallback(() => {
    subscribeToMore({
      document: POST_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        const newFeedItem = subscriptionData.data.newPost
        return Object.assign({}, prev, {
          getPosts: [newFeedItem, ...prev.getPosts]
        })
      }
    })
  }, [subscribeToMore])

  const subscribeToDeletedPosts = useCallback(() => {
    subscribeToMore({
      document: DELETE_POST_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        const newFeedItem = subscriptionData.data.deletePostSub
        const newPosts = [...prev.getPosts].filter(post => post.id !== newFeedItem.id)
        return Object.assign({}, prev, {
          getPosts: [...newPosts, ...prev.getPosts]
        })
      }
    })
  }, [subscribeToMore])

  useEffect(() => {
    subscribeToNewPosts()
    subscribeToDeletedPosts()
  }, [subscribeToNewPosts, subscribeToDeletedPosts])

  return (
    <>
      {error && <div>An unexpected error has occored!</div>}
      <Grid columns={1}>
        <Grid.Row>
          {user && (
            <Grid.Column width={15}>
              <PostForm />
            </Grid.Column>
          )}
        </Grid.Row>
        <Grid.Row>
          {loading ? (
            <h1>Loading posts...</h1>
          ) : (
              <Transition.Group>
                {
                  data.getPosts && data.getPosts.map(post => (
                    <Grid.Column
                      key={post.id}
                      style={{ marginBottom: 10, marginLeft: 10, marginRight: 10 }}
                    >
                      <PostCard
                        callback={deletePostCallback}
                        post={post}
                        refetch={refetch}
                      />
                    </Grid.Column>
                  ))
                }
              </Transition.Group>
            )}
        </Grid.Row>
      </Grid>
    </>
  )
}

export default Home
