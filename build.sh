#!/usr/bin/env bash
# 构建apk
function androidBuildAPK() {
  ./gradlew assembleRelease
}

#构建aab
function androidBuildAAB() {
  ./gradlew bundleRelease
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
      androidBuildAAB
    elif [ "$buildArgs" == "APK" ]; then
      androidBuildAPK
    fi
  fi

}
main "$@"
