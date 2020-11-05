import React, { useRef, useState, useContext } from 'react'
import { gql, useMutation } from '@apollo/client'
import { Grid, Card, Image, Icon, Header } from 'semantic-ui-react'
import { AuthContext } from '../context/auth'
import { Redirect } from 'react-router-dom'
import moment from 'moment'


function MyAccount(props) {

  const { user } = useContext(AuthContext)

  let userProfilePic = ''

  if (user){
    if (localStorage.getItem("profilePic")){
      userProfilePic = localStorage.getItem("profilePic")
    } else {
      userProfilePic = user.profilePic
    }

  }

  const [fileUri,setFileUri] = useState(userProfilePic)
  
  const fileRef = useRef('')

  const [uploadFile] = useMutation(UPLOAD_FILE, {
    onCompleted: data => {
      console.log(data)
      setFileUri(data.uploadProfilePic.url)
      localStorage.setItem("profilePic", data.uploadProfilePic.url)
      fileRef.current.value = ''
    }
  })

  const uploadPic = () => {
    const file = fileRef.current.files[0]
    if (!file) return
    uploadFile({ variables: { file } })
  }

  const profilePic = !fileUri || fileUri === '' ? 'https://react.semantic-ui.com/images/avatar/large/molly.png' : fileUri

  return (
    <>
      {!user ? <Redirect to="/login" /> :
        <>
          <Grid centered>
            <Grid.Row centered>
              <Grid.Column width={4}>
                <Header as='h2' icon float="center">
                  <Icon name='settings' />
                  Account Settings
                </Header>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={12}>
                <Card fluid raised>
                  <Image centered
                    src={profilePic}
                    size="medium"
                    float="right"
                    alt="File was not found!"
                  />
                  <span style={{ textAlign: 'center' }}>
                    <input type="file" ref={fileRef} id="profilePic" style={{border:'1px inset',lineHeight:'14px'}} onChange={uploadPic} />
                  </span>
                  <Card.Content centered="true">
                    <Card.Header>{user.username} </Card.Header>
                    <Card.Meta>Member since {moment(user.createdAt).format('MMM DD, YYYY')}</Card.Meta>
                    <Card.Description>{user.email}</Card.Description>
                  </Card.Content>
                </Card>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </>
      }
    </>
  )
}

const UPLOAD_FILE = gql`
  mutation uploadProfilePic($file: Upload!){
    uploadProfilePic(file:$file){
      url
      filename
      mimetype
      encoding
    }
  }
`

export default MyAccount
