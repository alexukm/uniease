#!/bin/bash

# Set path to the gradle file
GRADLE_FILE="android/app/build.gradle"

# Check if file exists
if [[ ! -f $GRADLE_FILE ]]; then
    echo "Error: $GRADLE_FILE does not exist!"
    exit 1
fi

# Extract versionCode and versionName
versionCode=$(grep "versionCode" $GRADLE_FILE | awk '{print $2}')
versionName=$(grep "versionName" $GRADLE_FILE | awk '{print $2}' | tr -d '"')

# Increment versionCode
newVersionCode=$((versionCode + 1))

# Increment minor version in versionName
IFS='.' read -ra ADDR <<< "$versionName"
majorVersion=${ADDR[0]}
minorVersion=${ADDR[1]}
newMinorVersion=$((minorVersion + 1))
newVersionName="$majorVersion.$newMinorVersion"

# Update the gradle file
sed -i "s/versionCode $versionCode/versionCode $newVersionCode/" $GRADLE_FILE
sed -i "s/versionName \"$versionName\"/versionName \"$newVersionName\"/" $GRADLE_FILE

echo "Updated versionCode to $newVersionCode and versionName to $newVersionName"

# Run npm command
echo "Running 'npm run aab'..."
npm run aab
