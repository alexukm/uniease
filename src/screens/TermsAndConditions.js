import React , {Component} from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, SafeAreaView } from "react-native";

class TermsAndConditions extends Component{


  render(){
    return (
      <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Terms and conditions</Text>
        <ScrollView>
          <Text style={styles.tcP}>1. Contractual Relationship</Text>
          <Text style={styles.tcP}>These Terms of Use (“Terms”) govern the access or use by you, an individual of applications, websites, content, products, and services (the “Services”) made available by EvoTech Innovations PLT, a limited liability partnership company established in the Malaysia, registered at the Companies Commision of Malaysia (SSM) under number 202304001471.</Text>
          <Text style={styles.tcP}>PLEASE READ THESE TERMS CAREFULLY BEFORE ACCESSING OR USING THE SERVICES.</Text>
          <Text style={styles.tcL}>{'\u2022'} Your access and use of the Services constitutes your agreement to be bound by these Terms, which establishes a contractual relationship between you and UniEase. If you do not agree to these Terms, you may not access or use the Services. These Terms expressly supersede prior agreements or arrangements with you. UniEase may immediately terminate these Terms or any Services with respect to you, or generally cease offering or deny access to the Services or any portion thereof, at any time for any reason.</Text>
          <Text style={styles.tcL}>{'\u2022'} Supplemental terms may apply to certain Services, such as policies for a particular event, activity or promotion, and such supplemental terms will be disclosed to you in connection with the applicable Services. Supplemental terms are in addition to, and shall be deemed a part of, the Terms for the purposes of the applicable Services. Supplemental terms shall prevail over these Terms in the event of a conflict with respect to the applicable Services.</Text>
          <Text style={styles.tcL}>{'\u2022'} UniEase may amend the Terms related to the Services from time to time. Amendments will be effective upon UniEase’s posting of such updated Terms at this location or the amended policies or supplemental terms on the applicable Service. Your continued access or use of the Services after such posting constitutes your consent to be bound by the Terms, as amended.</Text>
          <Text style={styles.tcL}>{'\u2022'} Our collection and use of personal information in connection with the Services is as provided in UniEase Privacy Policy located at https://www.unieaseapp.com/privacy. UniEase may provide to a claims processor or an insurer any necessary information (including your contact information) if there is a complaint, dispute or conflict, which may include an accident, involving you and a Third Party Provider (including a transportation network company driver) and such information or data is necessary to resolve the complaint, dispute or conflict.</Text>
          <Text style={styles.tcP}>2. The Services</Text>

          <Text style={styles.tcL}>{'\u2022'} The Services constitute a technology platform that enables users of EvoTech’s mobile applications (UniEase) or websites (www.unieaseapp.com/unieaseapp) provided as part of the Services (each, an “Application”) to arrange and schedule transportation and/or other services with independent third party providers of such services, including independent third party transportation providers and independent third party other providers under agreement with UniEase or certain of UniEase affiliates (“Third Party Providers”). Unless otherwise agreed by UniEase in a separate written agreement with you, the Services are made available solely for your personal, noncommercial use.</Text>
          <Text style={styles.tcL}>{'\u2022'} YOU ACKNOWLEDGE THAT UNIEASE DOES NOT PROVIDE TRANSPORTATION OR OTHER SERVICES OR FUNCTION AS A TRANSPORTATION CARRIER AND THAT ALL SUCH TRANSPORTATION OR OTHER SERVICES ARE PROVIDED BY INDEPENDENT THIRD PARTY CONTRACTORS WHO ARE NOT EMPLOYED BY UNIEASE OR ANY OF ITS AFFILIATES.</Text>
          <Text style={styles.tcL}>{'\u2022'} License: Subject to your compliance with these Terms, EvoTech grants you a limited, non-exclusive, non-sublicensable, revocable, non-transferrable license to: (i) access and use the Applications on your personal device solely in connection with your use of the Services; and (ii) access and use any content, information and related materials that may be made available through the Services, in each case solely for your personal, noncommercial use. Any rights not expressly granted herein are reserved by EvoTech and EvoTech’s licensors.</Text>
          <Text style={styles.tcL}>{'\u2022'} Restrictions: You may not: (i) remove any copyright, trademark or other proprietary notices from any portion of the Services; (ii) reproduce, modify, prepare derivative works based upon, distribute, license, lease, sell, resell, transfer, publicly display, publicly perform, transmit, stream, broadcast or otherwise exploit the Services except as expressly permitted by UniEase; (iii) decompile, reverse engineer or disassemble the Services except as may be permitted by applicable law; (iv) link to, mirror or frame any portion of the Services; (v) cause or launch any programs or scripts for the purpose of scraping, indexing, surveying, or otherwise data mining any portion of the Services or unduly burdening or hindering the operation and/or functionality of any aspect of the Services; or (vi) attempt to gain unauthorized access to or impair any aspect of the Services or its related systems or networks.</Text>
          <Text style={styles.tcL}>{'\u2022'} Third Party Services and Content: The Services may be made available or accessed in connection with third party services and content (including advertising) that UniEase does not control. You acknowledge that different terms of use and privacy policies may apply to your use of such third party services and content. UniEase does not endorse such third party services and content and in no event shall UniEase be responsible or liable for any products or services of such third party providers. Additionally, Apple Inc., Google, Inc., Microsoft Corporation or BlackBerry Limited and/or their applicable international subsidiaries and affiliates will be third-party beneficiaries to this contract if you access the Services using Applications developed for Apple iOS, Android, Microsoft Windows, or Blackberry-powered mobile devices, respectively. These third party beneficiaries are not parties to this contract and are not responsible for the provision or support of the Services in any manner. Your access to the Services using these devices is subject to terms set forth in the applicable third party beneficiary’s terms of service.</Text>
          <Text style={styles.tcL}>{'\u2022'} Ownership: The Services and all rights therein are and shall remain EvoTech property or the property of EvoTech licensors. Neither these Terms nor your use of the Services convey or grant to you any rights: (i) in or related to the Services except for the limited license granted above; or (ii) to use or reference in any manner EvoTech’s company names, logos, product and service names, trademarks or services marks or those of EvoTech’s licensors.</Text>





          <Text style={styles.tcP}>The use of this website is subject to the following terms of use</Text>
        </ScrollView>
      </View>
      </SafeAreaView>
    );
  }

}

const { width , height } = Dimensions.get('window');

const styles = {
  container:{
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10
  },
  title: {
    fontSize: 22,
    alignSelf: 'center'
  },
  tcP: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 12,
    textAlign: 'justify', // Update this line
    marginRight: 10 // And this line
  },
  tcL:{
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 10,
    fontSize: 12,
    textAlign: 'justify', // Update this line
    marginRight: 10 // And this line
  },
  tcContainer: {
    marginTop: 15,
    marginBottom: 15,
    height: height * .7
  },
  button:{
    backgroundColor: '#136AC7',
    borderRadius: 5,
    padding: 10
  },
  buttonDisabled:{
    backgroundColor: '#999',
    borderRadius: 5,
    padding: 10
  },
  buttonLabel:{
    fontSize: 14,
    color: '#FFF',
    alignSelf: 'center'
  }
}


export default TermsAndConditions;
