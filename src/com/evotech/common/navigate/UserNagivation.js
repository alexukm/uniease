import { getUserInfoWithLocal } from "../appUser/UserInfo";
import { userType } from "../appUser/UserConstant";
import { navigate } from "./GloableNagivate";

export const skipLoginPage = async () => {
  const userInfo = await getUserInfoWithLocal();
  if (userInfo) {
    if (userInfo.userType === userType.USER) {
      navigate("UserLogin");
    }
    if (userInfo.userType === userType.DRIVER) {
      navigate("DriverLogin");
    }
  } else {
    navigate.navigate("Home");
  }
};
