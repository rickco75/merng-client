import React from 'react'
import { Segment, Container, List, Image, Icon } from 'semantic-ui-react'

function Footer() {
  return (
    <div>
      <Segment inverted vertical style={{ width: '100%' , margin: '5em 0em 0em', padding: '1em 0em' }}>
        <Container textAlign='center'>          
          <Image centered size='mini' circular src='/lizardlogosmall.png' /> 
          <List horizontal inverted divided link size='small'>
            <List.Item as='a' href='#'>
              Site Map
          </List.Item>
            <List.Item as='a' href='#'>
              Contact Us
          </List.Item>
            <List.Item as='a' href='#'>
              Terms and Conditions
          </List.Item>
            <List.Item as='a' href='#'>
              Privacy Policy
          </List.Item>
          </List>
          <span style={{padding:'1rem'}}><Icon name="copyright outline" />2021</span>
        </Container>
      </Segment>
      </div>
  )
}

export default Footer
