# Contributing

## Development

### Requirements

* Git
* Java JDK 7 or OpenJDK 7
* Maven 3
* an ARSnova API provider
  ([ARSnova Backend](https://github.com/thm-projects/arsnova-backend))

The backend dependency is automatically downloaded by Maven but you need to
follow the steps for setting up CouchDB described in the backend documentation.

### Environment

If you have not already cloned the Presenter repository, now is the time:

	$ git clone https://github.com/thm-projects/arsnova-presenter.git
	$ cd arsnova-presenter

Before you make changes to Presenter, run the following command to set up a
development environment with a running Java servlet container and all
dependencies:

	$ mvn clean jetty:run -Denv=dev -Prun-server

Afterwards, the application will be accessible at:

http://localhost:8080/presenter/

Changes to the code base can be tested without restarting the servlet container.
Without a correctly set up CouchDB you will still be able to access the
application and log in.

### Workflow

New features for the next release are developed on topic branches and merged
into the master branch when they are ready. Each minor release has its own
maintenance branch. Bugs affecting the stable version and the master should be
fixed in the maintenance branch which is merged into master afterwards. Doing it
the other way around would cause new features from master to be merged into the
maintenance branch. If a fix is more complex, a topic branch should be created
which is merged into the maintenance branch when it is ready.

The following commands check out the maintenance branch for version 1.0, commit
changes and merge them into master.

	$ git checkout 1.0
	(do your code modifications)
	$ git add file1 [file2] [...]
	$ git commit -m "Your commit description"
	$ git checkout master
	$ git merge 1.0

In case a fix has to be applied to multiple maintenance branches, commit the
changes to the oldest branch and merge them into the maintenance branch of the
following release. Then take this branch and again merge it into the branch
of the following release (and so on). At last merge the current maintenance
branch into master.

### Releases

For the release of a new major/minor version the following steps should be taken
in the Git repository (example for version 1.0.0). Only step 2 and 3 need to be
followed for patch releases.

1. Create a branch for release and maintenance of version 1.0:

		$ git checkout -b 1.0
		$ git add pom.xml

2. Release version 1.0.0:

		(adjust pom.xml, remove the SNAPSHOT marker from the version number: 1.0.0-SNAPSHOT => 1.0.0)
		$ git add pom.xml
		$ git commit -m "Release version 1.0.0"
		$ git tag v1.0.0

3. Prepare development of the next patch release:

		(adjust pom.xml, => 1.0.1-SNAPSHOT)
		$ git add pom.xml
		$ git commit -m "Start next patch release cycle"

4. Merge 1.0 into master using "ours" strategy to prevent later merges of the
maintenance branch to apply the version change commit to master:

		$ git checkout master
		$ git merge -s ours 1.0 -m "Ignore version changes from release branch when merging"

5. Prepare development of the next major/minor release on master:

		(adjust pom.xml, => 1.1.0-SNAPSHOT)
		$ git add pom.xml
		$ git commit -m "Start next release cycle"

## Building for production

### Requirements

* Java JDK 7 or OpenJDK 7 (or later)
* Maven 3

While ARSnova Presenter runs on any platform supported by Java servlet
containers it can currently only be built in Unix-like environments (Linux,
MacOS X).

### Building & packaging

To create a .war archive ready for deployment in a Java servlet container run
the following command:

	$ mvn clean package -Denv=prod
