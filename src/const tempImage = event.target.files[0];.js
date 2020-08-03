const tempImage = event.target.files[0];
    console.log(tempImage);
    let mimeType;
    const imageType = tempImage;
    if (imageType === 'image/jpeg' || 'image/jpg') {
      mimeType = 'JPEG';
    } else {
      mimeType = 'PNG';
    }

    Resizer.imageFileResizer(
      tempImage,
      300,
      300,
      mimeType,
      100,
      0,
      (uri) => {
        console.log(uri);
        const file = {
          uri: uri,
          type: imageType,
          name: tempImage.name,
        };
        console.log(file);
        this.setState({selectedFile: file});
      },
      'blob',
    );