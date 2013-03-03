#!/bin/bash
TARGET_PATH="$1" # mandatory
VERSION="$2"     # optional
BUILD="$3"       # optional
DOJO_BUILD_PATH="$TARGET_PATH/../tmp/dojo"
VERSION_FILE_PATH="$DOJO_BUILD_PATH/version"

if [[ -z "$TARGET_PATH" ]]; then
	echo No target path set.
	exit 1
fi

# Update submodules
git submodule update --init

# Write build version info into JavaScript file later used by Dojo
mkdir -p "$VERSION_FILE_PATH"
echo "define([], function() { return {" \
	version: \"$VERSION\", \
	commitId: \"$(git log -n 1 --pretty=format:%h)\", \
	buildTime: \"$(date --rfc-3339=seconds)\", \
	buildNumber: \"$BUILD\" \
	"}; });" \
	> "$VERSION_FILE_PATH/version.js"

# Run Dojo build script
vendor/dojotoolkit.org/util/buildscripts/build.sh \
	profile=src/main/config/presenter-application.profile.js \
	releaseDir="$DOJO_BUILD_PATH/dojo"

# Copy Dojo application build and Dojo resources
#rm $(find "$DOJO_BUILD_PATH" -name \*.uncompressed.js -type f)
cp -R "$DOJO_BUILD_PATH/app" "$TARGET_PATH/app"
mkdir -p "$TARGET_PATH/lib/dojotoolkit.org"
cp -R "$DOJO_BUILD_PATH/dojo/dojo" "$TARGET_PATH/lib/dojotoolkit.org/dojo"
cp -R "$DOJO_BUILD_PATH/dojo/dijit" "$TARGET_PATH/lib/dojotoolkit.org/dijit"
cp -R "$DOJO_BUILD_PATH/dojo/dojox" "$TARGET_PATH/lib/dojotoolkit.org/dojox"
cp -R "$DOJO_BUILD_PATH/dojo/dojo/resources" "$TARGET_PATH/app/resources"
