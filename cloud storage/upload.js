// Import React
import React, {useState} from 'react';
// Import required components
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import {RNS3} from 'react-native-aws3';

import {launchImageLibrary} from 'react-native-image-picker';

const App = () => {
  const [filePath, setFilePath] = useState({});
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');

  const chooseFile = () => {
    let options = {
      mediaType: 'photo',
    };
    launchImageLibrary(options, (response) => {
      console.log('Response = ', response);
      setUploadSuccessMessage('');
      if (response.didCancel) {
        alert('User cancelled camera picker');
        return;
      } else if (response.errorCode == 'camera_unavailable') {
        alert('Camera not available on device');
        return;
      } else if (response.errorCode == 'permission') {
        alert('Permission not satisfied');
        return;
      } else if (response.errorCode == 'others') {
        alert(response.errorMessage);
        return;
      }
      setFilePath(response);
    });
  };

  const uploadFile = () => {
    if (Object.keys(filePath).length == 0) {
      alert('Please select image first');
      return;
    }
    RNS3.put(
      {
        // `uri` can also be a file system path (i.e. file://)
        uri: filePath.uri,
        name: filePath.fileName,
        type: filePath.type,
      },
      {
        keyPrefix: 'myuploads', 
        bucket: 'spy app',
        region: 'ap-north-1',  
        accessKey: 'AKIH73GS7S7C53M46OQ',
        
        secretKey: 'Pt/2hdyro977ejd/h2u8n939nh89nfdnf8hd8f8fd',
        
        successActionStatus: 201,
      },
    )
      .progress((progress) =>
        setUploadSuccessMessage(
          `Uploading: ${progress.loaded / progress.total} (${
            progress.percent
          }%)`,
        ),
      )
      .then((response) => {
        if (response.status !== 201)
          alert('Failed to upload image to S3');
        console.log(response.body);
        setFilePath('');
        let {
          bucket,
          etag,
          key,
          location
        } = response.body.postResponse;
        setUploadSuccessMessage(
          `Uploaded Successfully: 
          \n1. bucket => ${bucket}
          \n2. etag => ${etag}
          \n3. key => ${key}
          \n4. location => ${location}`,
        );
        /**
         * {
         *   postResponse: {
         *     bucket: "your-bucket",
         *     etag : "9f620878e06d28774406017480a59fd4",
         *     key: "uploads/image.png",
         *     location: "https://bucket.s3.amazonaws.com/**.png"
         *   }
         * }
         */
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titleText}>
        Upload Image {'\n'}
      
      </Text>
      <View style={styles.container}>
        {filePath.uri ? (
          <>
            <Image
              source={{uri: filePath.uri}}
              style={styles.imageStyle}
            />
            <Text style={styles.textStyle}>
              {filePath.uri}
            </Text>
            <TouchableOpacity
              activeOpacity={0.5}
              style={styles.buttonStyleGreen}
              onPress={uploadFile}>
              <Text style={styles.textStyleWhite}>
                Upload Image
              </Text>
            </TouchableOpacity>
          </>
        ) : null}
        {uploadSuccessMessage ? (
          <Text style={styles.textStyleGreen}>
            {uploadSuccessMessage}
          </Text>
        ) : null}
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.buttonStyle}
          onPress={chooseFile}>
          <Text style={styles.textStyleWhite}>
            Choose Image
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={{textAlign: 'center'}}>
        www.aboutreact.com
      </Text>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
  },
  textStyle: {
    padding: 10,
    color: 'black',
    textAlign: 'center',
  },
  textStyleGreen: {
    padding: 10,
    color: 'green',
  },
  textStyleWhite: {
    padding: 10,
    color: 'white',
  },
  buttonStyle: {
    alignItems: 'center',
    backgroundColor: 'orange',
    marginVertical: 10,
    width: '100%',
  },
  buttonStyleGreen: {
    alignItems: 'center',
    backgroundColor: 'green',
    marginVertical: 10,
    width: '100%',
  },
  imageStyle: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    margin: 5,
  },
});