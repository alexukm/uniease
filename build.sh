#!/usr/bin/env bash
keystore_password=$(grep MYAPP_UPLOAD_STORE_PASSWORD android/gradle.properties |  awk -F '=' '{print $2}')
key_password=$(grep MYAPP_UPLOAD_KEY_PASSWORD android/gradle.properties |  awk -F '=' '{print $2}')

# 构建apk
function androidBuildAPK() {
  ./gradlew assembleRelease
}

#构建aab
function androidBuildAAB() {
  ./gradlew bundleRelease
}

function aabSign() {
  cd app && rm -f output.zip \
   && C:/openlogic-openjdk-17.0.5+8-windows-x64/bin/java.exe -jar pepk.jar --keystore=unieaseapp.keystore  --alias=uniease-key --output=output.zip --include-cert --rsa-aes-encryption --encryption-key-path=./encryption_public_key.pem --keystore-pass="$keystore_password" --key-pass="$key_password"
}

function androidBuildClean() {
   ./gradlew clean
}
function main() {
  local buildPlatform=$1
  local buildArgs=$2
  if [ "$buildPlatform" = "android" ]; then

    if ! cd ./android && androidBuildClean; then
      echo "android build clean fail"
      exit 1
    fi

    if [ "$buildArgs" == "AAB" ]; then
      androidBuildAAB && aabSign
    elif [ "$buildArgs" == "APK" ]; then
      androidBuildAPK
    fi
  fi

}
main "$@"
