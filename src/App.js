import CSVReader from 'react-csv-reader'
import { Canvas, useLoader, extend, useFrame, useThree } from 'react-three-fiber'
import phone from './phone.glb'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import React, { Suspense, useRef, useState,useEffect } from 'react'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MapContainer, TileLayer, Popup, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'react-bootstrap';
import { divIcon } from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import './App.css';

function Phone() {
  const gltf = useLoader(GLTFLoader, phone)
  return <primitive object={gltf.scene} position={[0, 0, 0]} />
}

function Box() {
  return (
    <mesh>
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshStandardMaterial attach="material" transparent opacity={0.5} />
    </mesh>
  )
}

function UpdateCam() {
  // This one makes the camera move in and out
  useFrame(({ clock, camera }) => {
    //camera.rotation.z = 5 + Math.sin(clock.getElapsedTime()) * 5
  })
  return null
}

const Play = ({onPlayerClick}) => {
  return (
    <button type="button" className="btn btn-primary" onClick={onPlayerClick}>Play</button>
  )
}

const Pause = ({onPlayerClick}) => {
  return (
    <button type="button" className="btn btn-primary" onClick={onPlayerClick}>Pause</button>
  )
}

function App() {
  const [playing, setPlaying] = useState(false);
  const [lat, setLat] = useState(51.505)
  const [long, setLong] = useState(-0.09)
  const [index, setIndex] = useState(0)
  const [lastIndex, setLastIndex] = useState(0)
  let acc_x_values = []
  let acc_y_values = []
  let acc_z_values = []
  let gyro_x_values = []
  let gyro_y_values = []
  let gyro_z_values = []
  const [latValues,setLatValues] = useState([])
  const [longValues,setLongValues] = useState([])
  useEffect(() => {
    const interval = setInterval(() => {
      if(playing && index < lastIndex){ 
        setIndex(index + 1)
        console.log("index: " + index)
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [index,playing,lastIndex]);
  const handlePlayerClick = () => {
    if (!playing) {
      setPlaying(true)
      
    } else {
      setPlaying(false)
    }
  }

  const handleRestartClick = () => {
    setIndex(0)
  }
  const iconMarkup = renderToStaticMarkup(<i className=" fa fa-car fa-3x" />);
    const customMarkerIcon = divIcon({
      html: iconMarkup,
    });
  return (
    <div className="App">
      <Container fluid>
      <Row>
        <Col>IMU data visualizer</Col>
      </Row>
      <Row>
        <Col><CSVReader onFileLoaded={(data, fileInfo) => {
            data.forEach(element => {
              let measurementValue = Number.parseFloat(element[2])
              switch(element[1]){
                case "1":
                  // gyro_x
                  gyro_x_values.push(measurementValue)
                  break
                case "2":
                  // gyro_y
                  gyro_y_values.push(measurementValue)
                  break
                case "3":
                  // gyro_z
                  gyro_z_values.push(measurementValue)
                  break
                case "4":
                  // acc_x
                  acc_x_values.push(measurementValue)
                  break
                case "5":
                  // acc_y
                  acc_y_values.push(measurementValue)
                  break
                case "6":
                  // acc_z
                  acc_z_values.push(measurementValue)
                  break
                case "7":
                  // lat
                  setLatValues(latValues => latValues.concat(measurementValue))
                  break
                case "8":
                  // long
                  setLongValues(longValues => longValues.concat(measurementValue))
                  break   
                default:
                  break
              }
            });
            setLastIndex(acc_z_values.length)
          }}
          /></Col>
      </Row>
      <Row>

        <Col>
        { latValues[index] && longValues[index] &&
        <MapContainer style={{height: 300, width: 300}} center={[latValues[index],longValues[index]]} zoom={13} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
            <Marker position={[latValues[index],longValues[index]]} icon={customMarkerIcon}>
              <Popup>
                car position
              </Popup>
            </Marker>
        </MapContainer>
        }  
        </Col>

      </Row>
      <Row>
        <Col>
          <button type="button" className="btn btn-primary" onClick={handleRestartClick}>From start</button>
        </Col>
        <Col>
          {playing? <Pause onPlayerClick={handlePlayerClick} /> : <Play onPlayerClick={handlePlayerClick} />}
        </Col>
      </Row>
      </Container>
    </div>
  );
}

export default App;
