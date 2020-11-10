import React, { useRef, useState, useContext, useEffect } from 'react'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Grid, Card, Image, Icon, Header } from 'semantic-ui-react'
import { AuthContext } from '../context/auth'
import { Redirect } from 'react-router-dom'
import moment from 'moment'
import compressImage from '../util/compressImage'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = 'pk.eyJ1Ijoicmlja2NvNzUiLCJhIjoiY2toOXVuZXFyMHoydTJ6bW1vcjN4ZmhneiJ9.f2jn0n-4yoeLhH7mQAbkIA'


function MyAccount(props) {

  const { user } = useContext(AuthContext)

  let userProfilePic = ''

  if (user) {
    if (localStorage.getItem("profilePic")) {
      userProfilePic = localStorage.getItem("profilePic")
    } else {
      userProfilePic = user.profilePic
    }

  }

  const [fileUri, setFileUri] = useState(userProfilePic)
  const [loading, setLoading] = useState(false)

  const [userLocation, setUserLocation] = useState(null)
  const [locationLoaded, setLocationLoaded] = useState(false)

  const [lng, setLng] = useState(-89.3064)
  const [lat, setLat] = useState(31.308)
  const [zoom, setZoom] = useState(2)
  const fileRef = useRef('')
  const mapContainerRef = useRef(null)


  useEffect(() => {
    // aquire users location information
    // fetch('https://api.ipify.org?format=json')
    //   .then(response => {
    //     return response.json();
    //   })
    //   .then((res) => {
    //     console.log(res.ip)
    fetch(`https://ipapi.co/json/`)
      .then(response => response.json())
      .then(res => {
        // console.log('ipapi res.latitude: ', res.latitude)
        // console.log('ipapi res.longitude: ', res.longitude)
        // console.log('ipapi res: ', res)
        setUserLocation(res)
        // setLat(res.latitude)
        // setLng(res.longitude)
        // setZoom(10)
        // setLocationLoaded(true)
      })
    //       .catch(err => console.log("ipapi.co error: ", err))
    //   })
    //   .catch(err=> console.log("api.ipify.org error: ", err))

    // fetch(`http://ip-api.com/json`, {
    //   credentials: 'same-origin',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   }
    // })
    //   .then(response => response.json())
    //   .then(res => {
    //     console.log(res)
    //     setUserLocation(res)
    //     setLat(res.lat)
    //     setLng(res.lon)
    //     setZoom(10)
    //     setLocationLoaded(true)
    //   })
    //   .catch(err => console.log("error fetching location details ", err))
    // }).catch((err) => console.error('Problem fetching my IP Address', err))
    function getLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
      } else {
        console.log("Geolocation is not supported by this browser.")
      }
    }

    function showPosition(position) {
      // console.log(position)
      setLat(position.coords.latitude)
      setLng(position.coords.longitude)
      setZoom(10)
      setLocationLoaded(true)
    }

    if (!locationLoaded) {
      getLocation()
    }
  }, [locationLoaded])

  useEffect(() => {
    if (user) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/outdoors-v11',
        center: [lng, lat],
        zoom: zoom
      });

      // Add navigation control (the +/- zoom buttons)
      map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

      if (locationLoaded) {
        map.on('load', () => {
          map.setCenter({ lon: lng, lat: lat })
        })
      }

      // Clean up on unmount
      return () => map.remove();
    }

  }, [locationLoaded, lng, lat, user, zoom])

  const [uploadFile] = useMutation(UPLOAD_FILE, {
    onCompleted: data => {
      console.log(data)
      setFileUri(data.uploadProfilePic.url)
      setLoading(false)
      localStorage.setItem("profilePic", data.uploadProfilePic.url)
      fileRef.current.value = ''
    }
  })

  const { data: userStatistics, loading: userMetricsLoading } = useQuery(GET_USER_STATISTICS, {
    variables: {
      username: user.username
    },
    onCompleted: data => {
      console.log(data)
    }
  })

  const uploadPic = (file) => {
    if (!file) return
    uploadFile({ variables: { file } })
  }

  async function handleImageUpload() {
    setLoading(true)
    const file = fileRef.current.files[0]
    const compressedFile = await compressImage(file)
    uploadPic(compressedFile)
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
            <Grid.Row centered>
              <Grid.Column width={12}>
                <Card fluid raised centered>
                  {loading ?
                    <span style={{ textAlign: 'center' }}>
                      <Icon size="huge" loading name="spinner" /></span> :
                    <span style={{ textAlign: 'center' }}>
                      <Image centered
                        src={profilePic}
                        size="medium"
                        float="right"
                        alt="File was not found!"
                      />
                      <div style={{ textAlign: 'center', paddingTop: '10px', paddingBottom: '8px' }}>
                        <input
                          type="file"
                          ref={fileRef}
                          id="profilePic"
                          onChange={handleImageUpload} />
                      </div>
                    </span>}
                </Card>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={12}>
                <Card fluid raised centered>
                  <Card.Content>
                    <Card.Header>User Information</Card.Header>
                    <Card.Description><h4>User Name: {user.username}</h4></Card.Description>
                    <Card.Description>Email: {user.email}</Card.Description>
                    <Card.Description>Member since {moment(user.createdAt).format('MMM DD, YYYY')}</Card.Description>
                  </Card.Content>
                </Card>
              </Grid.Column>
            </Grid.Row>
            {userMetricsLoading ? 'Loading User Metrics' : (
              <Grid.Row>
                <Grid.Column width={12}>
                  <Card fluid raised centered>
                    <Card.Content>
                      <Card.Header>Statistics</Card.Header>
                      <Card.Description>Total Posts: {userStatistics.getUserStatistics.totalPosts}</Card.Description>
                      <Card.Description>Total Comments: {userStatistics.getUserStatistics.totalComments}</Card.Description>
                      <Card.Description>Total Likes: {userStatistics.getUserStatistics.totalLikes}</Card.Description>                                            
                      <Card.Description></Card.Description>
                    </Card.Content>
                  </Card>
                </Grid.Column>
              </Grid.Row>
            )}
            {userLocation && (
              <Grid.Row>
                <Grid.Column width={12}>
                  <Card fluid raised centered>
                    <Card.Content>
                      <Card.Header>Location Information</Card.Header>
                      <Card.Description>
                        {userLocation.city} {userLocation.region}, {userLocation.postal}
                      </Card.Description>
                      <Card.Description>
                        Current IP: {userLocation.ip}
                      </Card.Description>
                    </Card.Content>
                  </Card>
                </Grid.Column>
              </Grid.Row>
            )}
            <Grid.Row>
              <Grid.Column width={12}>
                <Card fluid raised centered>
                  <div style={{ textAlign: 'center', height: '400px' }}></div>
                  <Card.Content centered="true">
                    <div>
                      <div ref={mapContainerRef} className="mapContainer" />
                    </div>
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

const GET_USER_STATISTICS = gql`
  query getUserStatistics($username: String!){
    getUserStatistics(username: $username){
      totalPosts
      totalLikes
      totalComments
    }
  }
`
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
