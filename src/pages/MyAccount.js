import React, { useRef, useState, useContext } from 'react'
import { gql } from '@apollo/client'
import { Grid, Card, Image, Icon, Header } from 'semantic-ui-react'
import { AuthContext } from '../context/auth'
import { Redirect } from 'react-router-dom'
import moment from 'moment'
function MyAccount(props) {

  const { user } = useContext(AuthContext)
  console.log(user)
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
                  <Header.Subheader>
                      Manage your account settings
                  </Header.Subheader>
                </Header>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={12}>
                <Card fluid raised>
                  <Image centered
                    src='https://react.semantic-ui.com/images/avatar/large/molly.png'
                    size="medium"
                    float="right"
                  />
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

export default MyAccount
