import React, { useRef } from 'react'
import { Form, Button } from 'semantic-ui-react'

import { useMutation, gql } from '@apollo/client'

import { useForm } from '../util/hooks'
import { FETCH_POSTS_QUERY } from '../util/graphql'

function PostForm() {

  const { values, onChange, onSubmit } = useForm(createPostCallback, {
    body: '',
    url: ''
  })

  const uploadFileRef = useRef('')

  const [uploadFile] = useMutation(UPLOAD_FILE, {
    onCompleted: data => {
      console.log(data)
      values.url = data.uploadFile.url
    }
  })

  const handleFileChange = () => {
    const file = uploadFileRef.current.files[0]
    if (!file) return
    uploadFile({ variables: { file } })
  }

  const [createPost, { error }] = useMutation(CREATE_POST_MUTATION, {
    variables: values,
    onCompleted: data => {
      console.log("createPost onCompleted: ", data)
    },
    update(proxy, result) {
      const data = proxy.readQuery({
        query: FETCH_POSTS_QUERY
      })

      const newData = { ...data }
      newData.getPosts = [result.data.createPost, ...data.getPosts]
      // proxy.writeQuery({
      //   query: FETCH_POSTS_QUERY, data: {
      //     getPosts: [result.data.createPost, ...newData.getPosts]
      //   }
      // })
      values.body = ''
      uploadFileRef.current.value = null
    },
    onError(err) {
      //console.log(err.graphQLErrors[0].extensions.exception.errors)
    }
  })

  function createPostCallback() {
    createPost()
  }

  return (
    <>
      <Form onSubmit={onSubmit}>
        <Form.Field>
          <Form.Input
            placeholder="Say Something . . ."
            name="body"
            onChange={onChange}
            value={values.body}
            error={error ? true : false}
            width="15"
          />
          <input
            style={{width:"20rem",border:"none"}}
            type="file"
            ref={uploadFileRef}
            onChange={handleFileChange} />
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
      filename
      mimetype
      encoding
    }
  }
`

const CREATE_POST_MUTATION = gql`
  mutation createPost($body: String!, $url: String){
    createPost(body: $body, url: $url){
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
      url
    }
  }
`

export default PostForm
