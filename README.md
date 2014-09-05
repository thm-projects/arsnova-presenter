# ARSnova Presenter

Presenter is a rich internet application for lecturers intended to be used for presentation of ARSnova data, especially Peer Instruction results. In contrast to ARSnova Mobile Presenter targets desktop browsers.

## Development

### Requirements

* Git
* Java JDK 7 or OpenJDK 7
* Maven 3
* (CouchDB set up for ARSnova, see arsnova-backend documentation and arsnova-setuptool)

### Obtaining the source code

Create a clone of the Presenter repository:

	$ git clone https://github.com/thm-projects/arsnova-presenter.git presenter
	$ cd presenter

New features for the next release are developed on the master branch. Each minor release has its own maintenance branch which is called x.y-stable. Bugs affecting the stable version and the master should be fixed in the maintenance branch which is merged into master afterwards. Doing it the other way around would cause new features from master to be merged into the maintenance branch.

The following commands check out a maintenance branch, commit changes and merge them into master.

	$ git checkout x.y-stable
	(do your code modifications)
	$ git add file1 [file2] [...]
	$ git commit -m "Your commit description"
	$ git checkout master
	$ git merge x.y-stable

### Workflow for the release of a new version

For the release of a new version the following steps should be taken in the Git repository:

	Remove the maven SNAPSHOT marker from the version number in pom.xml (x.y.z-SNAPSHOT => x.y.z) and commit:
		$ git add pom.xml
		$ git commit -m "Change version for release: x.y.z"
	Create a tag:
		$ git tag -a x.y.z -m "Tag release x.y.z"
	Create a maintenance branch, increase the patch level and commit (only major and minor releases):
		$ git branch -b x.y-stable
		(adjust pom.xml)
		$ git add pom.xml
		$ git commit -m "Change version for development: x.y.1-SNAPSHOT"
	Increase the minor part (y) or patch level (z) of the version number, readd the SNAPSHOT marker in pom.xml and commit the changes:
		$ git add pom.xml
		$ git commit -m "Change version for development: x.y.z-SNAPSHOT"
	Merge x.y-stable into master using "ours" strategy to prevent later merges of the maintenance branch to apply the version change commit to master:
		$ git checkout master
		$ git merge -s ours x.y-stable -m "Ignore version changes on stable branch when merging"
	Increase the version number in master (only major and minor releases):
		(adjust pom.xml)
		$ git add pom.xml
		$ git commit -m "Change version for development: x.y.0-SNAPSHOT"

### Setting up the environment

If you want to make changes to Presenter, run the following command to set up a development environment with a running Java servlet container and all dependencies:

	$ mvn -Denv=dev -Prun-server clean jetty:run

Afterwards, the application will be accessible under:

	http://localhost:8080/presenter/

Changes to the code base can be tested without restarting the servlet container. Without a correctly set up CouchDB you will still be able to access the application and log in.

## Building Presenter for a production environment

### Requirements

* Java JDK 6 or OpenJDK 6 (or later)
* Maven 3

While ARSnova Presenter runs on any platform supported by Java servlet containers it can currently only be built in Unix-like environments (Linux, MacOS X).

### Adjusting settings for a production environment

If the ARSnova RESTful API (provided by arsnova-backend) is not deployed in the ROOT context (/) of the servlet container, you need to make the adjustments to the file src/main/websources/prod.html. Look for the following section:

	var dojoConfig = {
		arsnova: {
			mobileStudentSessionUrl: "/index.html#id/${sessionKey}"
		},
		arsnovaApi: {
			root: "/"
		}
	};

Prepend the context path of arsnova-backend to the URLs set with "mobileStudentSessionUrl" and "root". If you are planning to run Presenter under another (sub)domain you have to make sure that arsnova-backend is configured correctly to allow Cross Origin Requests (CORS) form that host. Otherwise browsers will block the requests sent by Presenter.

### Building a package for a production environment

To create a WAR archive ready for deployment in a Java servlet container run the following command:

	$ mvn -Denv=prod clean package

## Deployment in a production environment

### Requirements

* a Java servlet container already running arsnova-backend
* the Presenter application in form of a webarchive (.war file)

Presenter is a front end application running on top of arsnova-backend. See installation instructions provided by arsnova-backend if it is not installed yet. If you want to adjust the default settings of Presenter and/or do not want to use a provided .war archive, start with the "Build" section.

### Deployment in a Java servlet container

For information about how to deploy a .war archive with your servlet container please refer to the servlet container's documentation.

## License

GPLv3 or later, see COPYING file
