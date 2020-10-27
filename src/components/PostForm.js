import React from 'react'
import { Form, Button } from 'semantic-ui-react'

import { useMutation, gql } from '@apollo/client'

import { useForm } from '../util/hooks'
import { FETCH_POSTS_QUERY } from '../util/graphql'

function PostForm() {

  const { values, onChange, onSubmit } = useForm(createPostCallback, {
    body: ''
  })

  const [uploadFile] = useMutation(UPLOAD_FILE,{
    onCompleted: data => console.log(data)    
  })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    uploadFile({ variables: { file } })
  }


  const [createPost, { error }] = useMutation(CREATE_POST_MUTATION, {
    variables: values,
    update(proxy, result) {
      const data = proxy.readQuery({
        query: FETCH_POSTS_QUERY
      })
      const newData = {...data}
      newData.getPosts = [result.data.createPost, ...data.getPosts]
      proxy.writeQuery({
        query: FETCH_POSTS_QUERY, data: {
          getPosts: [result.data.createPost, ...data.getPosts]
        }
      })
      //data.getPosts = [result.data.createPost, ...data.getPosts]
      // proxy.writeQuery({
      //   // query: FETCH_POSTS_QUERY, data: {
      //   //   getPosts: [result.data.createPost, ...data.getPosts]
      //   // }
      //   query: FETCH_POSTS_QUERY, data      
      // })
      console.log(result)
      values.body = ''
    },
    onError(err) {
      console.log(err.graphQLErrors[0].extensions.exception.errors)
    }
  })

  function createPostCallback() {
    createPost()
  }

  return (
    <>
      <Form onSubmit={onSubmit}>
        <h2>Create a post: </h2>
        <Form.Field>
          <Form.TextArea
            placeholder="Hi World!"
            name="body"
            onChange={onChange}
            value={values.body}
            error={error ? true : false}
          />
          <Form.Input
            type="file"
            onChange={handleFileChange}
            label="Upload File" />
          <Button type="submit" color="teal">
            Submit
          </Button>
        </Form.Field>
      </Form>
      {error && (
        <div className="ui error message" style={{ marginBottom: 20 }}>
          <ul className="list">
            <li>{error.graphQLErrors[0].message}</li>
          </ul>
        </div>
      )}
    </>
  )
}

const UPLOAD_FILE = gql`
  mutation uploadFile($file: Upload!){
    uploadFile(file:$file){
      url
    }
  }
`

const CREATE_POST_MUTATION = gql`
  mutation createPost($body: String!){
    createPost(body: $body){
      id 
      body
      createdAt
      username
      likes {
        id
        username
        createdAt
      }
      likeCount
      comments{
        id
        body
        username
        createdAt
      }
      commentCount
    }
  }
`

export default PostForm
