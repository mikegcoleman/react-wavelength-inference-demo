/* eslint-disable class-methods-use-this */
/* eslint-disable react/sort-comp */
/* eslint-disable no-constant-condition */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-console */
/* eslint-disable react/destructuring-assignment */
import React, {Component} from 'react';
import './App.css';
import axios from 'axios';
import imageCompression from 'browser-image-compression';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      URL: 'http://100.25.33.242:5000/api/1.0/classify',
      originalImage: null,
      loading: false,
      analyzedImage: null,
      error: false,
      errorMessage: '',
    };


  }

  uploadImageHandler = (event) => {
    this.setState({
      error: false,
      errorMessage: '',
      analyzedImage: null,
    });

    const imageFile = event.target.files[0];
    console.log(imageFile);
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 300,
      useWebWorker: true,
    };
    try {
      console.log('compressing');
    } catch (e) {
      console.log(e);
      this.setState({
        error: e,
      });
    }
    const compressedImage = imageCompression(imageFile, options).then((img) => {
      this.setState({
        selectedFile: img,
        originalImage: URL.createObjectURL(img),
      });
      console.log(img);
    });
  };

  processImageHandler = () => {
    const fd = new FormData();
    this.setState({originalImage: null});
    this.setState({loading: true});
    console.log(`${this.state.selectedFile} <-- selectedFile`);
    fd.append('file', this.state.selectedFile);

    axios.post(this.state.URL, fd).then((res) => {
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
      this.setState({
        analyzedImage: imgURL,
      });
    });
  };

  handleURLChange = (event) => {
    this.setState({
      URL: event.target.value,
    });
  };

  render() {
    return (
      <div className="App">
        <header>Wavelength Inference Demo App</header>
        <label>
          API endpoint: <br />
          <input
            type="text"
            name="URL"
            value={this.state.URL}
            onChange={this.handleURLChange}
          />
          <br />
        </label>
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
        {this.state.loading ? <h2>Processing the image . . . </h2> : ''}
        {this.state.error ? (
          <h2>An Error occured - {this.state.errorMessage}</h2>
        ) : (
          ''
        )}
        {this.state.analyzedImage ? (
          <img src={this.state.analyzedImage} alt="Analyzed version" />
        ) : (
          ''
        )}
      </div>
    );
  }
}

export default App;
