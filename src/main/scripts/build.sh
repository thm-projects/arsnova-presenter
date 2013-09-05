#!/bin/bash
BUILD_ENV="$1"   # mandatory (prod or dev)
TARGET_PATH="$2" # mandatory
VERSION="$3"     # optional
BUILD="$4"       # optional
DOJO_BUILD_PATH="$TARGET_PATH/../tmp/dojo"
VERSION_FILE_PATH="$DOJO_BUILD_PATH/version"
DATE=$(date -u +"%FT%TZ")

if [ prod != "$BUILD_ENV" ] && [ dev != "$BUILD_ENV" ]; then
	echo "First parameter has to be a valid build environment (prod, dev)."
	exit 1
fi

if [[ -z "$TARGET_PATH" ]]; then
	echo "Second parameter has to be a valid target path."
	exit 1
fi

# Update submodules
git submodule update --init

# Write build version info into JavaScript file later used by Dojo and set build profile
mkdir -p "$VERSION_FILE_PATH"
if [ prod = "$BUILD_ENV" ]; then
	VERSION_FILE_CONTENT="define([], function () { return { \
		version: \"$VERSION\", \
		commitId: \"$(git log -n 1 --pretty=format:%h)\", \
		buildTime: \"$DATE\", \
		buildNumber: \"$BUILD\" \
		}; });"
	DOJO_BUILD_PROFILE="presenter-application.prod"
else
	VERSION_FILE_CONTENT="define([], function () { return { \
		version: \"DEVELOPMENT\", \
		commitId: \"\", \
		buildTime: \"$DATE\", \
		buildNumber: \"\" \
		}; });"
	DOJO_BUILD_PROFILE="presenter-application.dev"
fi
echo "$VERSION_FILE_CONTENT" > "$VERSION_FILE_PATH/version.js"

# Run Dojo build script
vendor/dojotoolkit.org/util/buildscripts/build.sh \
	profile="src/main/config/$DOJO_BUILD_PROFILE.profile.js" \
	releaseDir="$DOJO_BUILD_PATH/dojo"

# Copy Dojo application build and Dojo resources
if [ prod = "$BUILD_ENV" ]; then
	find "$DOJO_BUILD_PATH" -name \*.uncompressed.js -type f -print0 | xargs -0 rm
fi
cp -R "$DOJO_BUILD_PATH/app" "$TARGET_PATH/app"
mkdir -p "$TARGET_PATH/lib/dojotoolkit.org"
cp -R "$DOJO_BUILD_PATH/dojo/dojo" "$TARGET_PATH/lib/dojotoolkit.org/dojo"
cp -R "$DOJO_BUILD_PATH/dojo/dijit" "$TARGET_PATH/lib/dojotoolkit.org/dijit"
cp -R "$DOJO_BUILD_PATH/dojo/dojox" "$TARGET_PATH/lib/dojotoolkit.org/dojox"
cp -R "$DOJO_BUILD_PATH/dojo/dojo/resources" "$TARGET_PATH/app/resources"
