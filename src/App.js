/* eslint-disable class-methods-use-this */
/* eslint-disable react/sort-comp */
/* eslint-disable no-constant-condition */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/destructuring-assignment */
import React, {Component} from 'react';
import './App.css';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import {Ellipsis} from 'react-spinners-css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      URL: '',
      originalImage: null,
      loading: false,
      analyzedImage: null,
      error: false,
      errorMessage: '',
      timer: null,
    };
  }

  uploadImageHandler = (event) => {
    this.setState({
      error: false,
      errorMessage: '',
      analyzedImage: null,
    });
    if (!event.target.files[0]) {
      return;
    }

    const imageFile = event.target.files[0];
    const filename = imageFile.name.toLowerCase();
    const regex = new RegExp('(.*?).(jpeg|jpg|png)$');

    if (!regex.test(filename)) {
      this.setState({
        error: true,
        errorMessage:
          'Please select an JPEG or PNG file with a jpg, jpeg, or png extension',
        originalImage: null,
      });
      return;
    }
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 400,
      useWebWorker: true,
    };
    // eslint-disable-next-line no-unused-vars
    const compressedImage = imageCompression(imageFile, options).then((img) => {
      this.setState({
        selectedFile: img,
        originalImage: URL.createObjectURL(img),
      });
    });
  };

  processImageHandler = async () => {
    if (this.state.URL === '') {
      this.setState({
        errorMessage: 'Please enter the server FQDN or IP address',
        error: true,
      });
      return;
    }
    const t0 = performance.now();
    const fd = new FormData();
    const apiEndpoint = `http://${this.state.URL}:5000/api/1.0/classify`;
    this.setState({originalImage: null});
    this.setState({loading: true});
    fd.append('file', this.state.selectedFile);

    try {
      const res = await axios.post(apiEndpoint, fd, {timeout: 7500});
      this.setState({
        loading: false,
      });
      if (res.data.message !== 'OK') {
        this.setState({
          error: true,
          errorMessage: res.data.message,
        });
        return;
      }
      let tempImage = res.data.image.substring(2);
      tempImage = tempImage.substring(0, tempImage.length - 1);
      const imgURL = `data:image/png;base64,${tempImage}`;
      const t1 = performance.now();
      this.setState({
        analyzedImage: imgURL,
        timer: ((t1 - t0) / 1000).toFixed(3),
      });
    } catch (err) {
      this.setState({
        error: true,
        errorMessage: err.message,
        loading: false,
      });
    }
  };

  handleURLChange = (event) => {
    this.setState({
      error: false,
      errorMessage: '',
      URL: event.target.value,
    });
  };

  render() {
    return (
      <div className="App">
        <div className="header">
          <h3>Wavelength Inference Demo App</h3>
        </div>
        <div className="api">
          <label>
            Server IP or FQDN: <p />
            <input
              className="input"
              type="text"
              name="URL"
              value={this.state.URL}
              size="20"
              onChange={this.handleURLChange}
            />
            <br />
          </label>
        </div>
        <input type="file" onChange={this.uploadImageHandler} /> <br />
        <p />
        {this.state.originalImage ? (
          <div>
            <img src={this.state.originalImage} alt="Original upload" /> <p />
            <button type="submit" onClick={this.processImageHandler}>
              Process Image
            </button>
          </div>
        ) : (
          ''
        )}
        {this.state.loading ? (
          <h2>
            <Ellipsis color="#0073ff" />
          </h2>
        ) : (
          ''
        )}
        {this.state.error ? (
          <div className="error">
            <h2>An Error occured - {this.state.errorMessage}</h2>
          </div>
        ) : (
          ''
        )}
        {this.state.analyzedImage ? (
          <div>
            <img src={this.state.analyzedImage} alt="Analyzed version" />
            <p>Image processing took {this.state.timer} seconds</p>
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }
}

export default App;
