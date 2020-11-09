import React, { useRef, useState, useContext, useEffect } from 'react'
import { gql, useMutation } from '@apollo/client'
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

  const [lng, setLng] = useState(-77.3788)
  const [lat, setLat] = useState(69.3145)
  const [zoom, setZoom] = useState(9)
  const fileRef = useRef('')
  const mapContainerRef = useRef(null)

  useEffect(() => {
    // aquire users location information
    // fetch('https://api.ipify.org?format=json')
    //   .then(response => {
    //     return response.json();
    // }).then((res) => {
    //   console.log(res.ip)
    fetch(`http://ip-api.com/json`, {
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(res => {
        setUserLocation(res)
        setLat(res.lat)
        setLng(res.lon)
        setZoom(10)
        setLocationLoaded(true)
      })
      .catch(err => console.log("error fetching location details ", err))
    // }).catch((err) => console.error('Problem fetching my IP Address', err))
  }, [])

  useEffect(() => {
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

  }, [locationLoaded])

  const [uploadFile] = useMutation(UPLOAD_FILE, {
    onCompleted: data => {
      console.log(data)
      setFileUri(data.uploadProfilePic.url)
      setLoading(false)
      localStorage.setItem("profilePic", data.uploadProfilePic.url)
      fileRef.current.value = ''
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
                      <div style={{ textAlign: 'center', paddingTop: '10px' }}>
                        <input
                          type="file"
                          ref={fileRef}
                          id="profilePic"
                          onChange={handleImageUpload} />
                      </div>
                    </span>}
                  <Card.Content centered="true">
                    <Card.Header>{user.username} </Card.Header>
                    <Card.Meta>Member since {moment(user.createdAt).format('MMM DD, YYYY')}</Card.Meta>
                    <Card.Description>{user.email}</Card.Description>
                    {userLocation && (
                      <div style={{ marginTop: 10, textAlign: 'center' }}>
                        <Card.Description>
                          {userLocation.city} {userLocation.regionName}, {userLocation.zip}
                        </Card.Description>
                        <Card.Meta>
                          Current IP: {userLocation.query}
                        </Card.Meta>
                      </div>
                    )}
                  </Card.Content>
                </Card>
              </Grid.Column>
            </Grid.Row>
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
