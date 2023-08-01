import React, { useState } from 'react';
import { View, Text, Image, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Header = ({ title }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>&lt; Back</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
};

const EditProfile = () => {
  const profile = {
    firstName: 'Jane',
    lastName: 'Doe',
    avatar: 'https://example.com/jane-doe-avatar.png',
  };
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [avatar, setAvatar] = useState(profile.avatar);

  const handleSubmit = () => {
    // logic to handle form submission
  };

  return (
    <View style={styles.container}>
      <Header title="Edit Profile" />
      <Image
        style={styles.halfBackgroundImage}
        source={require("../picture/acc_bg.png")}
      />
      <View style={styles.avatarContainer}>
        <Image
          style={styles.avatar}
          source={{uri: 'https://www.bootdey.com/img/Content/avatar/avatar3.png'}}
        />
        <TouchableOpacity style={styles.changeAvatarButton} onPress={() => {/* open image picker */}}>
          <Text style={styles.changeAvatarButtonText}>Change Avatar</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
      </View>
      <View style={styles.submitButtonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => handleSubmit({firstName, lastName, avatar})}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  halfBackgroundImage: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    zIndex: 0,
  },
  form: {
    width: '90%',
  },
  label: {
    marginTop: 20,
    fontSize: 14,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#0055A4',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '90%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  avatarContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changeAvatarButton: {
    marginTop: 10,
  },
  changeAvatarButtonText: {
    color: '#1E90FF',
    fontSize: 14,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    zIndex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 10,
  },
  backButtonText: {
    fontSize: 14,
    color: '#000000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButtonContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 20,
    alignItems: 'center',
  },
});

export default EditProfile;
