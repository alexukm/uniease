import React, {Component} from "react";
import {View, Text, ScrollView, Dimensions, TouchableOpacity, SafeAreaView} from "react-native";
import {Modal, Button, Input, FormControl, NativeBaseProvider} from "native-base";

import {getUserInfoWithLocal} from "../com/evotech/common/appUser/UserInfo";
import {driverDeleteAccount, userDeleteAccount} from "../com/evotech/common/http/BizHttpUtil";
import {responseOperation} from "../com/evotech/common/http/ResponseOperation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useNavigation} from "@react-navigation/native";
import {showDialog} from "../com/evotech/common/alert/toastHelper";

const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;
};
const deleteContent = "I agree to delete my account";
const navigation = useNavigation();

class DeleteAccount extends Component {

    state = {
        accepted: false,
        modalVisible: false,
        value: "",
        isMatch: false,
    };


    setModalVisible = (visible) => {
        this.setState({modalVisible: visible});
    };

    handleChangeText = (value) => {
        this.setState({value}, () => {
            if (value.length === deleteContent.length) {
                if (value === deleteContent) {
                    this.setState({isMatch: true});
                } else {
                    this.setState({isMatch: false});
                }
            }
        });
    };


    handleProceed = async () => {
        if (this.state.isMatch) {
            const userInfo = await getUserInfoWithLocal();
            if (!userInfo) {
                //用户信息查询失败
                showDialog('WARNING', 'Delete Account', "Local User info query failed,Please Login again!");
                return;
            }
            if (userInfo.isDriver()) {
                driverDeleteAccount().then(data => {
                    responseOperation(data.code, () => {
                        //清空本地所有信息
                        AsyncStorage.clear();
                        //跳转Home
                        navigation.navigate("Home");
                    }, () => {
                        showDialog('WARNING', 'Delete Account', data.message);
                    });
                }).catch(err => {
                    showDialog('WARNING', 'Delete Account', "Delete failed,Please try again later!");
                });

            }
            if (userInfo.isUser()) {
                userDeleteAccount().then(data => {
                    responseOperation(data.code, () => {
                        //清空本地所有信息
                        AsyncStorage.clear();
                        //跳转Home
                        navigation.navigate("Home");
                    }, () => {
                        showDialog('WARNING', 'Delete Account', data.message);
                    });
                }).catch(err => {
                    showDialog('WARNING', 'Delete Account', "Delete failed,Please try again later!");
                });
            }
        } else {
            showDialog('WARNING', 'Delete Account', "Input text is not match");
        }
    };

  render() {
    return (
      <NativeBaseProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.container}>
            <Text style={styles.title}>Account Deletion Policy</Text>
            <ScrollView
              style={styles.tcContainer}
              onScroll={({ nativeEvent }) => {
                if (isCloseToBottom(nativeEvent)) {
                  this.setState({
                    accepted: true,
                  });
                }
              }}
            >
              <Text style={styles.tcP}>Definitions: In these terms, "Account" refers to the personal account created by users on our platform or service, UniEase.
                The term "Platform" specifically pertains to the UniEase platform.
                The term "Service" refers to the functionalities provided by UniEase to users, including but not limited to "Ride Reservation" and others.</Text>
              <Text style={styles.tcP}>Preconditions for Account Cancellation:
                When applying for account cancellation, all orders associated with the account must be in a completed
                status or cancel status. If there are ongoing orders, please proceed with the cancellation
                request after their completion.</Text>
              <Text style={styles.tcP}>Account Cancellation Request: </Text>
              <Text style={styles.tcL}>{"\u2022"} Upon submission of the account cancellation request, users will no longer
                be able to log in or access any information related to the account, and all account information along
                with associated order details will be permanently deleted.</Text>
              <Text style={styles.tcL}>{"\u2022"} Prior to submitting the account cancellation request, please ensure that
                you have retained or backed up all necessary data information. Please note that account cancellation is
                an irreversible action, and we cannot recover your account data after the cancellation.</Text>
              <Text style={styles.tcL}>{"\u2022"} Once the account cancellation is completed, all services, subscriptions,
                or other engagements associated with the account will be automatically terminated,
                and we shall not be liable for any resulting losses or responsibilities.</Text>


              <Text style={styles.tcP}>Refund Policy:
                Users with pending or ongoing refund requests will not be able to proceed with the account
                cancellation. Please wait for the completion of the refund process before reapplying for account cancellation.</Text>

              <Text style={styles.tcP}>Disclaimer:
                After account cancellation, users will no longer be bound by our Terms of Service and Privacy Policy.
                Please be aware that we shall not bear any responsibility for any leakage or consequences arising from the
                user's self-maintenance of account information and other data after account cancellation.</Text>
              <Text style={styles.tcP}>Changes and Termination:
                We reserve the right to modify or terminate the terms for account cancellation at any time.
                In case of any changes, we will notify users through appropriate communication channels.</Text>
              <Text style={styles.tcP}>Legal Jurisdiction:
                These account cancellation terms are governed by relevant laws, and any disputes will be subject
                to the jurisdiction of the relevant legal authorities.</Text>

            </ScrollView>

            <TouchableOpacity
              disabled={!this.state.accepted}
              onPress={() => {
                this.setModalVisible(true);
              }}
              style={this.state.accepted ? styles.button : styles.buttonDisabled}
            >
              <Text style={styles.buttonLabel}>Accept</Text>
            </TouchableOpacity>

            <Modal
              isOpen={this.state.modalVisible}
              onClose={() => this.setModalVisible(false)}
              avoidKeyboard
              size="full"
            >
              <Modal.Content>
                <Modal.CloseButton />
                <Modal.Header>Confirm Delete?</Modal.Header>
                <Modal.Body>
                  Please enter ' I agree to delete my account '
                  <FormControl mt="3">
                    <FormControl.Label>Delete</FormControl.Label>
                    <Input
                      value={this.state.value}
                      size="lg"
                      maxLength={deleteContent.length}
                      onChangeText={this.handleChangeText}
                    />
                  </FormControl>
                  {this.state.value.length === deleteContent.length && !this.state.isMatch ?
                    <Text style={{ color: "red" }}>Please enter: I agree to delete my account</Text> : null}
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    bg={this.state.isMatch ? "#136AC7" : "#999"}
                    flex="1"
                    onPress={this.handleProceed}
                    disabled={!this.state.isMatch}  // Add this line
                  >
                    Proceed
                  </Button>
                </Modal.Footer>


              </Modal.Content>
            </Modal>
          </View>
        </SafeAreaView>
      </NativeBaseProvider>
    );
  }
}

const {width, height} = Dimensions.get("window");

const styles = {

  container: {
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    alignSelf: "center",
  },
  tcP: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 12,
    textAlign: "justify",
  },
  tcL: {
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 10,
    fontSize: 12,
    textAlign: "justify",
  },
  tcContainer: {
    marginTop: 15,
    marginBottom: 25,
    height: height * .8,
  },

  button: {
    backgroundColor: "#136AC7",
    borderRadius: 5,
    padding: 10,
  },

  buttonDisabled: {
    backgroundColor: "#999",
    borderRadius: 5,
    padding: 10,
  },

  buttonLabel: {
    fontSize: 14,
    color: "#FFF",
    alignSelf: "center",
  },

};

export default DeleteAccount;
