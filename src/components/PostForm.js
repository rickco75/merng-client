import React, { useRef, useState } from 'react'
import { Form, Button, Icon } from 'semantic-ui-react'

import { useMutation, gql } from '@apollo/client'

import { useForm } from '../util/hooks'
import { FETCH_POSTS_QUERY } from '../util/graphql'

import compressImage from '../util/compressImage'

function PostForm() {

  const { values, onChange, onSubmit } = useForm(createPostCallback, {
    body: '',
    url: ''
  })

  const uploadFileRef = useRef('')
  const [loading, setLoading] = useState(false)
  const [uploadedFilename, setUploadedFilename] = useState('')

  const [uploadFile] = useMutation(UPLOAD_FILE, {
    onCompleted: data => {
      setLoading(false)
      setUploadedFilename(data.uploadFile.filename)
      console.log(data)
      values.url = data.uploadFile.url
    }
  })

  const handleFileChange = (file) => {
    //const file = uploadFileRef.current.files[0]
    if (!file) return
    uploadFile({ variables: { file } })
  }

  async function handleImageUpload() {
    setLoading(true)
    const file = uploadFileRef.current.files[0]
    if (!file) return
    const compressedFile = await compressImage(file)
    handleFileChange(compressedFile)
  }

  const [createPost, { error }] = useMutation(CREATE_POST_MUTATION, {
    variables: values,
    onCompleted: data => {
      console.log("createPost onCompleted: ", data)
      setLoading(false)
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
      console.log("Error with create post ", err)
      setLoading(false)
    }
  })

  function createPostCallback() {
    setLoading(true)
    createPost()
  }

  return (
    <div className="stickyPostForm">
      <Form onSubmit={onSubmit} style={{ marginBottom: 5, marginLeft: 8 }}>
        <Form.Field>
          <Form.Input
            placeholder="Say Something . . ."
            name="body"
            onChange={onChange}
            value={values.body}
            error={error ? true : false}
            width="16"
          />
          {loading && <span style={{ textAlign: 'center' }}>
            <Icon size="huge" loading name="spinner" /></span>}
          <span>
            <input
              title=" "
              style={{ width: "25rem", border: "inline" }}
              type="file"
              ref={uploadFileRef}
              onChange={handleImageUpload} />
              {!loading && 
            <Button style={{ margin: '1rem' }} circular size="mini" type="submit" color="teal">
              Submit
              </Button> }
          </span>
          <span>{uploadedFilename}</span>
        </Form.Field>
      </Form>
      {
        error && error.graphQLErrors[0].message && (
          <div className="ui error message" style={{ marginBottom: 20 }}>
            <ul className="list">
              <li>{error.graphQLErrors[0].message}</li>
            </ul>
          </div>
        )
      }
    </div>
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
      userCreated
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
      user {
        username
        email
        profilePic
        createdAt
      }
    }
  }
`

export default PostForm
