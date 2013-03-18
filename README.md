# ARSnova Presenter

Presenter is a rich internet application for lecturers intended to be used for presentation of (Peer Instruction) questions and their results. In contrast to ARSnova (arsnova-legacy-js, Sencha Touch) and ARSnova2 (arsnova-js, Dojo) the presenter targets desktop browsers.

## Installation


### Requirements

* a Java servlet container running arsnova-war
* the presenter application in form of a .war file

ARSnova Presenter is a front end application running on top of arsnova-war. See installation instructions provided by arsnova-war if it is not installed yet. If you want to adjust the default settings of ARSnova Presenter and/or do not want to use a provided .war archive, start with the "Build" section.


### Deployment in a Java servlet container

For information about how to deploy a .war archive with your servlet container please refer to the servlet container's documentation.


## Build


### Requirements

* Java JDK 7 or OpenJDK 7
* Maven 3

While ARSnova Presenter runs on any platform supported by Java servlet containers it can currently only be built in Unix-like environments (Linux, MacOS X).


### Adjust settings for your production environment

If the ARSnova RESTful API (arsnova-war) is not deployed in the ROOT context (/) of the servlet container, you need to make the adjustments to the file src/main/websources/prod.html. Look for the following section:

	var dojoConfig = {
		arsnova: {
			mobileStudentSessionUrl: "/index.html#id/${sessionKey}"
		},
		arsnovaApi: {
			root: "/"
		}
	};

Prepend the context path of arsnova-war to the URLs set with "mobileStudentSessionUrl" and "root".


### Build a package for production use

To create a WAR archive ready for deployment in a Java servlet container run the following command:

	$ mvn -Denv=prod clean package


## Development


### Requirements

* Java JDK 7 or OpenJDK 7
* Maven 3


### Setting up the environment

If you want to make changes to the ARSnova Presenter application simply run the following to commands to set up a development environment with a running Java servlet container and all dependencies:

	$ mvn -Parsnova-war clean process-resources
	$ mvn -Denv=dev package jetty:run

The application will be accessible under:

	http://localhost:8080/presenter/

Changes to the code base can be tested without restarting the servlet container.
