import React, { useContext, useEffect } from 'react'
import { useQuery, useSubscription } from '@apollo/client'

import { Grid, Transition } from 'semantic-ui-react'
import { AuthContext } from '../context/auth'
import PostCard from '../components/PostCard'
import PostForm from '../components/PostForm'
import { FETCH_POSTS_QUERY, POST_SUBSCRIPTION } from '../util/graphql'

function Home(props) {

  const { subscribeToMore, loading, data, refetch } = useQuery(FETCH_POSTS_QUERY);
  
  const { newPost,  subLoading } = useSubscription(POST_SUBSCRIPTION)

  const { user } = useContext(AuthContext)

  function deletePostCallback() {
    props.history.push('/')
  }

  const subscribeToNewPosts = () =>{
    subscribeToMore({
      document: POST_SUBSCRIPTION,
      updateQuery: (prev, {subscriptionData}) => {
        if (!subscriptionData.data) return prev
        const newFeedItem = subscriptionData.data.newPost
        return Object.assign( {}, prev, {
          getPosts: [newFeedItem, ...prev.getPosts]
        })
      }
    })
  } 
  
  useEffect(()=>{
    subscribeToNewPosts()
  },[])
  
  return (
    <Grid columns={2}>
      <Grid.Row className="page-title ">
        <h1 className="homeHeader">Recent Posts</h1>
      </Grid.Row>
      <Grid.Row>
        {user && (
          <Grid.Column>
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
                      style={{ marginBottom: 20 }}
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
  )
}

export default Home
