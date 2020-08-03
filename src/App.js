/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-console */
/* eslint-disable react/destructuring-assignment */

import React, {Component} from 'react';
import './App.css';
import axios from 'axios';

// http://100.25.33.242:5000/api/1.0/classify

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
    };
  }

  fileSelectedHandler = (event) => {
    this.setState({
      error: false,
      errorMessage: '',
      analyzedImage: null,
    });
    console.log(event.target.files[0]);
    this.setState({
      selectedFile: event.target.files[0],
      originalImage: URL.createObjectURL(event.target.files[0]),
    });
  };

  fileUploadHandler = () => {
    const fd = new FormData();
    this.setState({originalImage: null});
    this.setState({loading: true});
    fd.append('file', this.state.selectedFile);

    axios.post(this.state.URL, fd).then((res) => {
      console.log(res.data);
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
        <input type="file" onChange={this.fileSelectedHandler} /> <br />
        <p />
        {this.state.originalImage ? (
          <div>
            <img src={this.state.originalImage} alt="Original upload" /> <p />
            <button type="submit" onClick={this.fileUploadHandler}>
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
