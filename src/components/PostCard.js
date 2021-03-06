import React, { useContext } from 'react'
import { Link } from 'react-router-dom'

import { Card, Icon, Label, Image, Button } from 'semantic-ui-react'
import moment from 'moment'
import { AuthContext } from '../context/auth'
import LikeButton from './LikeButton'
import DeleteButton from './DeleteButton'
import MyPopup from '../util/MyPopup'

function PostCard({ callback, post: { body, createdAt, id, username, userCreated, likeCount, commentCount, likes, url, user: {profilePic, createdAt: userCreatedAt} } }) {

  const { user } = useContext(AuthContext)

  const uc =  userCreatedAt ? moment(userCreatedAt).format("MMM yyyy") : 'not available'
  const avatarPopupMessage = `${username} has been a member since ${uc}`

  const profilePicSrc = profilePic ? profilePic : 'https://react.semantic-ui.com/images/avatar/large/molly.png'

  return (
    <Card fluid raised>
      <Card.Content>
        <MyPopup
          content={avatarPopupMessage}>
          <Image
            avatar
            floated='right'
            size='mini'
            src={profilePicSrc}
          />
        </MyPopup>
        <Card.Header>{username}</Card.Header>
        <Card.Meta as={Link} to={`/posts/${id}`}>{moment(createdAt).fromNow(true)}</Card.Meta>
        <Card.Description>
          {body}
        </Card.Description>
        {url &&
          <Card.Description>
            <MyPopup
              content="View Comments">
              <Image as={Link}  to={`/posts/${id}`}
                src={url}
                size="small" />
            </MyPopup>
          </Card.Description>
        }
      </Card.Content>
      <Card.Content extra>
        <LikeButton user={user} post={{ id, likes, likeCount }} />
        <MyPopup
          content="Comment on this post">
          <Button labelPosition='right' as={Link} to={`/posts/${id}`}>
            <Button color='blue' basic>
              <Icon name='comments' />
            </Button>
            <Label color='blue' basic pointing='left'>
              {commentCount}
            </Label>
          </Button>
        </MyPopup>
        {user && user.username === username && <DeleteButton callback={callback} postId={id} />}
      </Card.Content>
    </Card>
  )
}

export default PostCard
